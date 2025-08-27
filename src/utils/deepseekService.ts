import type {
  Food,
  RecommendationContext,
  RecommendationResult,
  RecommendationReason,
} from '@/types';
import { RecommendationReasonType } from '@/types';

// DeepSeek API 配置
interface DeepSeekConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// DeepSeek API 请求格式
interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  max_tokens: number;
  temperature: number;
  top_p?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// AI 推荐结果格式
interface AIRecommendationResponse {
  recommendedFoodId: string;
  confidence: number;
  reasons: string[];
  explanation: string;
  score: number;
  isExtendedRecommendation?: boolean; // 是否为扩展推荐
}

export class DeepSeekService {
  private config: DeepSeekConfig;
  private isOnline: boolean = navigator.onLine;
  private recentRecommendations: string[] = []; // 追踪最近的推荐
  private maxRecentSize: number = 10; // 最多记录10个最近推荐
  private lastCallbackTime: number | null = null; // 记录上次回调时间，用于定期触发

  constructor() {
    this.config = {
      apiUrl:
        import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
      model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
      maxTokens: 1000,
      temperature: 0.9, // 提高temperature增加随机性
    };

    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('网络已连接，将使用 DeepSeek API');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('网络已断开，将使用本地算法');
    });
  }

  /**
   * 检查是否可以使用 DeepSeek API
   */
  public canUseAPI(): boolean {
    return this.isOnline && !!this.config.apiKey && !!this.config.apiUrl;
  }

  /**
   * 格式化上下文信息为自然语言
   */
  private formatContext(context: RecommendationContext): string {
    const parts: string[] = [];

    if (context.currentWeather) {
      parts.push(`天气：${this.getWeatherDescription(context.currentWeather)}`);
    }

    if (context.temperature !== undefined) {
      parts.push(`温度：${context.temperature}°C`);
    }

    if (context.currentTime) {
      parts.push(`时间：${this.getTimeDescription(context.currentTime)}`);
    }

    if (context.currentSeason) {
      parts.push(`季节：${this.getSeasonDescription(context.currentSeason)}`);
    }

    if (context.userMood) {
      parts.push(`心情：${this.getMoodDescription(context.userMood)}`);
    }

    if (context.location) {
      parts.push(`位置：${context.location}`);
    }

    return parts.join('，');
  }

  /**
   * 格式化菜品列表为简洁的文本
   */
  private formatFoodList(foods: Food[]): string {
    return foods
      .map(food => {
        const parts = [food.name];

        if (food.tags && food.tags.length > 0) {
          parts.push(`(标签: ${food.tags.join('、')})`);
        }

        if (food.cuisine) {
          parts.push(`[${food.cuisine}]`);
        }

        if (food.spicyLevel !== undefined) {
          parts.push(`辣度${food.spicyLevel}/5`);
        }

        if (food.sweetLevel !== undefined) {
          parts.push(`甜度${food.sweetLevel}/5`);
        }

        return `${food.id}: ${parts.join(' ')}`;
      })
      .join('\n');
  }

  /**
   * 创建系统提示词
   */
  private createSystemPrompt(): string {
    return `你是一个专业的美食推荐助手。根据用户的当前情况（天气、时间、心情、季节等）和可选菜品列表，为用户推荐最合适的一道菜。

**重要提示**：如果可选菜品列表中的选项较少或重复性高，你可以：
1. 优先从现有列表中选择最合适的菜品
2. 如果现有菜品都不太合适，可以推荐一道符合当前情况的经典中餐菜品，但需要在 explanation 中说明这是额外推荐

**推荐策略**：
- 优先考虑用户的心情、天气、时间等因素
- 注重饮食营养搭配和季节性
- 避免过于重复的推荐，增加多样性
- 考虑菜品的制作难度和普及程度

请严格按照以下 JSON 格式返回推荐结果：
{
  "recommendedFoodId": "菜品ID或新推荐菜品名称",
  "confidence": 0.85,
  "reasons": ["推荐原因1", "推荐原因2", "推荐原因3"],
  "explanation": "详细的推荐解释，如果是额外推荐请说明原因",
  "score": 0.92,
  "isExtendedRecommendation": false
}

要求：
1. recommendedFoodId：如果从现有列表选择，使用菜品ID；如果是额外推荐，使用菜品名称
2. confidence 表示推荐置信度，范围 0-1
3. reasons 是推荐原因数组，每个原因要简洁明了
4. explanation 是详细的推荐解释，说明为什么这道菜最适合
5. score 是综合评分，范围 0-1
6. isExtendedRecommendation：true表示是额外推荐的菜品，false表示从现有列表选择
7. 必须返回标准的 JSON 格式，不要添加任何其他文字`;
  }

  /**
   * 创建用户查询
   */
  private createUserQuery(
    context: RecommendationContext,
    foods: Food[],
    recentChoices: string[] = []
  ): string {
    const contextStr = this.formatContext(context);
    const foodListStr = this.formatFoodList(foods);

    // 格式化最近选择的菜品
    const recentChoicesStr =
      recentChoices.length > 0
        ? `\n\n最近已推荐的菜品（请避免重复推荐）：\n${recentChoices.join('、')}`
        : '';

    return `当前情况：${contextStr}

可选菜品列表（共${foods.length}道菜）：
${foodListStr}${recentChoicesStr}

**重要推荐原则**：
- 🎯 **多样性第一**：绝对避免推荐最近已经推荐过的菜品
- 🔄 **增加随机性**：即使在相似条件下，也要尝试推荐不同的菜品
- 🍽️ **营养搭配**：考虑营养均衡和饮食多样性
- ⚡ **创新性**：优先推荐用户可能没尝试过的菜品组合
- 🌟 **适配性**：确保推荐符合当前的时间、天气、心情等条件

**推荐策略**：
1. 首先排除最近已推荐的菜品
2. 从剩余菜品中选择最适合当前情况的
3. 如果现有菜品都不够理想，可以推荐经典中餐菜品
4. 每次推荐都要带来新鲜感和惊喜

请根据上述原则为我推荐最合适的一道菜。`;
  }

  /**
   * 调用 DeepSeek API
   */
  private async callDeepSeekAPI(
    context: RecommendationContext,
    foods: Food[],
    recentChoices: string[] = []
  ): Promise<AIRecommendationResponse> {
    if (!this.canUseAPI()) {
      throw new Error('DeepSeek API 不可用');
    }

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: this.createSystemPrompt(),
      },
      {
        role: 'user',
        content: this.createUserQuery(context, foods, recentChoices),
      },
    ];

    const requestBody: DeepSeekRequest = {
      model: this.config.model,
      messages,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      top_p: 0.9,
      stream: false,
      presence_penalty: 0.6, // 增加存在惩罚，避免重复内容
      frequency_penalty: 0.8, // 增加频率惩罚，促进多样性
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data: DeepSeekResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('API 返回数据格式错误');
      }

      const content = data.choices[0].message.content;

      // 尝试解析 JSON 响应
      try {
        const aiResponse: AIRecommendationResponse = JSON.parse(content);

        // 如果是扩展推荐，不需要验证ID是否在现有列表中
        if (aiResponse.isExtendedRecommendation) {
          this.addToRecentRecommendations(aiResponse.recommendedFoodId);
          return aiResponse;
        }

        // 验证返回的菜品ID是否存在于现有列表
        const recommendedFood = foods.find(food => food.id === aiResponse.recommendedFoodId);
        if (!recommendedFood) {
          // 如果找不到对应ID，可能是AI建议了新菜品，标记为扩展推荐
          aiResponse.isExtendedRecommendation = true;
          console.log('AI 推荐了新菜品:', aiResponse.recommendedFoodId);
          this.addToRecentRecommendations(aiResponse.recommendedFoodId);
        } else {
          // 记录推荐的菜品名称到历史中
          this.addToRecentRecommendations(recommendedFood.name);
        }

        return aiResponse;
      } catch (parseError) {
        console.error('解析 AI 响应失败:', parseError);
        console.error('AI 响应内容:', content);
        throw new Error('AI 响应格式错误');
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('API 请求超时，请检查网络连接');
      }

      console.error('DeepSeek API 调用失败:', error);
      throw error;
    }
  }

  /**
   * 将 AI 响应转换为标准推荐结果
   */
  private convertToRecommendationResult(
    aiResponse: AIRecommendationResponse,
    foods: Food[]
  ): RecommendationResult {
    let food: Food;

    if (aiResponse.isExtendedRecommendation) {
      // 创建一个临时的 Food 对象用于扩展推荐
      food = {
        id: `ai_recommendation_${Date.now()}`,
        name: aiResponse.recommendedFoodId, // 对于扩展推荐，这里是菜品名称
        category: '智能推荐',
        categoryColor: '#6366f1',
        tags: ['AI推荐', '中餐'],
        description: aiResponse.explanation,
      };
    } else {
      const existingFood = foods.find(f => f.id === aiResponse.recommendedFoodId);
      if (!existingFood) {
        throw new Error('推荐的菜品不存在');
      }
      food = existingFood;
    }

    const reasons: RecommendationReason[] = aiResponse.reasons.map(reason => ({
      type: RecommendationReasonType.AI,
      message: reason,
      weight: 1.0 / aiResponse.reasons.length,
    }));

    return {
      food,
      score: aiResponse.score,
      reasons,
      confidence: aiResponse.confidence,
      explanation: aiResponse.explanation,
      source: 'ai',
    };
  }

  /**
   * 添加到最近推荐列表
   */
  private addToRecentRecommendations(foodName: string): void {
    this.recentRecommendations.unshift(foodName);
    if (this.recentRecommendations.length > this.maxRecentSize) {
      this.recentRecommendations = this.recentRecommendations.slice(0, this.maxRecentSize);
    }
  }

  /**
   * 获取最近推荐列表
   */
  public getRecentRecommendations(): string[] {
    return [...this.recentRecommendations];
  }

  /**
   * 清空最近推荐列表
   */
  public clearRecentRecommendations(): void {
    this.recentRecommendations = [];
  }

  /**
   * 获取 AI 推荐
   */
  public async getAIRecommendation(
    context: RecommendationContext,
    foods: Food[],
    userRecentChoices: string[] = []
  ): Promise<RecommendationResult> {
    if (foods.length === 0) {
      throw new Error('菜品列表为空');
    }

    try {
      // 合并AI自己的推荐历史和用户选择历史
      const allRecentChoices = [...this.recentRecommendations, ...userRecentChoices];
      const uniqueRecentChoices = [...new Set(allRecentChoices)].slice(0, 15); // 限制为15个，避免prompt过长

      const aiResponse = await this.callDeepSeekAPI(context, foods, uniqueRecentChoices);
      return this.convertToRecommendationResult(aiResponse, foods);
    } catch (error) {
      console.error('AI 推荐失败:', error);
      throw error;
    }
  }

  // 辅助方法 - 获取描述文本
  private getWeatherDescription(weather: string): string {
    const descriptions: { [key: string]: string } = {
      sunny: '晴天',
      cloudy: '多云',
      rainy: '雨天',
      snowy: '雪天',
      hot: '炎热',
      cold: '寒冷',
      humid: '潮湿',
      dry: '干燥',
    };
    return descriptions[weather] || weather;
  }

  private getTimeDescription(time: string): string {
    const descriptions: { [key: string]: string } = {
      breakfast: '早餐时间',
      lunch: '午餐时间',
      dinner: '晚餐时间',
      snack: '零食时间',
      anytime: '任何时候',
    };
    return descriptions[time] || time;
  }

  private getSeasonDescription(season: string): string {
    const descriptions: { [key: string]: string } = {
      spring: '春季',
      summer: '夏季',
      autumn: '秋季',
      winter: '冬季',
    };
    return descriptions[season] || season;
  }

  private getMoodDescription(mood: string): string {
    const descriptions: { [key: string]: string } = {
      happy: '开心',
      sad: '难过',
      stressed: '压力大',
      relaxed: '放松',
      energetic: '精力充沛',
      tired: '疲惫',
      comfort: '需要安慰',
      adventurous: '想尝试新事物',
    };
    return descriptions[mood] || mood;
  }

  /**
   * 获取菜品做法
   */
  public async getRecipe(dishName: string): Promise<any> {
    if (!this.canUseAPI()) {
      throw new Error('DeepSeek API 不可用');
    }

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `你是一个专业的烹饪专家，精通各种中式菜品的制作方法。用户会询问某道菜的做法，请提供详细、准确、实用的烹饪指导。

请严格按照以下 JSON 格式返回菜谱信息：
{
  "introduction": "菜品的简介和特色",
  "ingredients": [
    {"name": "食材名称", "amount": "用量"},
    {"name": "调料名称", "amount": "用量"}
  ],
  "steps": [
    {
      "description": "详细的制作步骤描述",
      "time": "预计时间（可选）",
      "tips": "小贴士（可选）"
    }
  ],
  "tips": ["烹饪小贴士1", "烹饪小贴士2"],
  "nutrition": "营养价值简介",
  "estimatedTime": "总制作时间",
  "difficulty": "难度等级（简单/中等/困难）"
}

要求：
1. 食材用量要具体明确（如：猪肉500g、生抽2勺等）
2. 制作步骤要详细清晰，便于操作
3. 提供实用的烹饪技巧和注意事项
4. 必须返回标准的 JSON 格式，不要添加任何其他文字
5. 所有文本内容使用中文`,
      },
      {
        role: 'user',
        content: `请告诉我"${dishName}"的详细做法，包括食材清单、制作步骤、烹饪技巧等。`,
      },
    ];

    const requestBody: DeepSeekRequest = {
      model: this.config.model,
      messages,
      max_tokens: 2000, // 做法内容需要更多token
      temperature: 0.3, // 降低温度确保回答更准确
      top_p: 0.9,
      stream: false,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20秒超时，给更多时间生成内容

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data: DeepSeekResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('API 返回数据格式错误');
      }

      const content = data.choices[0].message.content;

      // 尝试解析 JSON 响应
      try {
        const recipe = JSON.parse(content);
        return recipe;
      } catch (parseError) {
        console.error('解析菜谱响应失败:', parseError);
        console.error('AI 响应内容:', content);
        throw new Error('AI 响应格式错误');
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('API 请求超时，请检查网络连接');
      }

      console.error('DeepSeek API 调用失败:', error);
      throw error;
    }
  }

  /**
   * 获取菜品做法（流式版本）
   */
  public async getRecipeStream(
    dishName: string,
    onChunk: (chunk: string) => void,
    onComplete: (recipe: any) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (!this.canUseAPI()) {
      onError('DeepSeek API 不可用');
      return;
    }

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `你是一个专业的烹饪专家，精通各种中式菜品的制作方法。用户会询问某道菜的做法，请提供详细、准确、实用的烹饪指导。

请严格按照以下 JSON 格式返回菜谱信息：
{
  "introduction": "菜品的简介和特色",
  "ingredients": [
    {"name": "食材名称", "amount": "用量"},
    {"name": "调料名称", "amount": "用量"}
  ],
  "steps": [
    {
      "description": "详细的制作步骤描述",
      "time": "预计时间（可选）",
      "tips": "小贴士（可选）"
    }
  ],
  "tips": ["烹饪小贴士1", "烹饪小贴士2"],
  "nutrition": "营养价值简介",
  "estimatedTime": "总制作时间",
  "difficulty": "难度等级（简单/中等/困难）"
}

要求：
1. 食材用量要具体明确（如：猪肉500g、生抽2勺等）
2. 制作步骤要详细清晰，便于操作
3. 提供实用的烹饪技巧和注意事项
4. 必须返回标准的 JSON 格式，不要添加任何其他文字
5. 所有文本内容使用中文`,
      },
      {
        role: 'user',
        content: `请告诉我"${dishName}"的详细做法，包括食材清单、制作步骤、烹饪技巧等。`,
      },
    ];

    const requestBody: DeepSeekRequest = {
      model: this.config.model,
      messages,
      max_tokens: 2000,
      temperature: 0.3,
      top_p: 0.9,
      stream: true, // 启用流式传输
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('响应体不可读');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                // 流式传输完成
                try {
                  const recipe = JSON.parse(fullContent);
                  onComplete(recipe);
                } catch (parseError) {
                  console.error('解析完整菜谱失败:', parseError);
                  onError('解析菜谱数据失败');
                }
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0]?.delta?.content) {
                  const chunk = parsed.choices[0].delta.content;
                  fullContent += chunk;
                  onChunk(chunk);
                }
              } catch (parseError) {
                // 忽略解析错误，继续处理下一个chunk
                console.warn('解析流式数据chunk失败:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        onError('API 请求超时，请检查网络连接');
      } else {
        console.error('DeepSeek 流式 API 调用失败:', error);
        onError(error instanceof Error ? error.message : '获取菜谱失败');
      }
    }
  }

  /**
   * 获取菜品做法（模拟流式版本，用于fallback）
   */
  public async getRecipeSimulatedStream(
    dishName: string,
    onChunk: (chunk: string) => void,
    onComplete: (recipe: any) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      // 先获取完整菜谱
      const recipe = await this.getRecipe(dishName);

      // 将菜谱转换为文本
      const recipeText = JSON.stringify(recipe, null, 2);

      // 模拟流式传输
      const chunks = this.splitIntoChunks(recipeText, 20); // 每20个字符一个chunk

      for (const chunk of chunks) {
        onChunk(chunk);
        // 添加小延迟模拟真实流式效果
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      }

      onComplete(recipe);
    } catch (error) {
      onError(error instanceof Error ? error.message : '获取菜谱失败');
    }
  }

  /**
   * 智能流式JSON解析器
   */
  private parseStreamingJSON(content: string): any | null {
    try {
      // 尝试直接解析
      return JSON.parse(content);
    } catch (error) {
      // 如果解析失败，尝试修复常见的JSON格式问题
      try {
        // 移除末尾的不完整内容
        let cleanedContent = content;

        // 查找最后一个完整的JSON结构
        const lastBraceIndex = cleanedContent.lastIndexOf('}');
        if (lastBraceIndex > 0) {
          cleanedContent = cleanedContent.substring(0, lastBraceIndex + 1);
        }

        // 尝试解析清理后的内容
        const parsed = JSON.parse(cleanedContent);

        // 验证JSON结构是否完整
        if (this.isValidRecipeStructure(parsed)) {
          return parsed;
        }

        return null;
      } catch (secondError) {
        // 如果还是失败，尝试构建部分对象
        return this.buildPartialRecipe(content);
      }
    }
  }

  /**
   * 构建部分菜谱对象
   */
  private buildPartialRecipe(content: string): any | null {
    const partialRecipe: any = {};
    let hasAnyContent = false;

    // 尝试提取introduction
    const introMatch = content.match(/"introduction"\s*:\s*"([^"]*)"/);
    if (introMatch && introMatch[1]) {
      partialRecipe.introduction = introMatch[1];
      hasAnyContent = true;
    }

    // 尝试提取ingredients
    const ingredientsMatch = content.match(/"ingredients"\s*:\s*\[(.*?)\]/s);
    if (ingredientsMatch && ingredientsMatch[1]) {
      try {
        const ingredientsStr = `[${ingredientsMatch[1]}]`;
        const ingredients = JSON.parse(ingredientsStr);
        if (Array.isArray(ingredients) && ingredients.length > 0) {
          partialRecipe.ingredients = ingredients;
          hasAnyContent = true;
        }
      } catch (e) {
        // 如果解析失败，尝试手动解析
        const ingredientMatches = ingredientsMatch[1].match(/\{[^}]*\}/g);
        if (ingredientMatches) {
          const ingredients = [];
          for (const match of ingredientMatches) {
            try {
              const ingredient = JSON.parse(match);
              if (ingredient.name && ingredient.amount) {
                ingredients.push(ingredient);
              }
            } catch (e) {
              // 忽略解析失败的单个食材
            }
          }
          if (ingredients.length > 0) {
            partialRecipe.ingredients = ingredients;
            hasAnyContent = true;
          }
        }
      }
    }

    // 尝试提取steps
    const stepsMatch = content.match(/"steps"\s*:\s*\[(.*?)\]/s);
    if (stepsMatch && stepsMatch[1]) {
      try {
        const stepsStr = `[${stepsMatch[1]}]`;
        const steps = JSON.parse(stepsStr);
        if (Array.isArray(steps) && steps.length > 0) {
          partialRecipe.steps = steps;
          hasAnyContent = true;
        }
      } catch (e) {
        // 如果解析失败，尝试手动解析
        const stepMatches = stepsMatch[1].match(/\{[^}]*\}/g);
        if (stepMatches) {
          const steps = [];
          for (const match of stepMatches) {
            try {
              const step = JSON.parse(match);
              if (step.description) {
                steps.push(step);
              }
            } catch (e) {
              // 忽略解析失败的单个步骤
            }
          }
          if (steps.length > 0) {
            partialRecipe.steps = steps;
            hasAnyContent = true;
          }
        }
      }
    }

    // 尝试提取tips
    const tipsMatch = content.match(/"tips"\s*:\s*\[(.*?)\]/s);
    if (tipsMatch && tipsMatch[1]) {
      try {
        const tipsStr = `[${tipsMatch[1]}]`;
        const tips = JSON.parse(tipsStr);
        if (Array.isArray(tips) && tips.length > 0) {
          partialRecipe.tips = tips;
          hasAnyContent = true;
        }
      } catch (e) {
        // 如果解析失败，尝试手动解析
        const tipMatches = tipsMatch[1].match(/"([^"]*)"/g);
        if (tipMatches) {
          const tips = tipMatches.map(tip => tip.replace(/"/g, ''));
          if (tips.length > 0) {
            partialRecipe.tips = tips;
            hasAnyContent = true;
          }
        }
      }
    }

    // 尝试提取nutrition
    const nutritionMatch = content.match(/"nutrition"\s*:\s*"([^"]*)"/);
    if (nutritionMatch && nutritionMatch[1]) {
      partialRecipe.nutrition = nutritionMatch[1];
      hasAnyContent = true;
    }

    // 尝试提取estimatedTime
    const timeMatch = content.match(/"estimatedTime"\s*:\s*"([^"]*)"/);
    if (timeMatch && timeMatch[1]) {
      partialRecipe.estimatedTime = timeMatch[1];
      hasAnyContent = true;
    }

    // 尝试提取difficulty
    const difficultyMatch = content.match(/"difficulty"\s*:\s*"([^"]*)"/);
    if (difficultyMatch && difficultyMatch[1]) {
      partialRecipe.difficulty = difficultyMatch[1];
      hasAnyContent = true;
    }

    return hasAnyContent ? partialRecipe : null;
  }

  /**
   * 验证菜谱JSON结构是否完整
   */
  private isValidRecipeStructure(recipe: any): boolean {
    // 检查是否至少有一个有效字段
    const validFields = [
      'introduction',
      'ingredients',
      'steps',
      'tips',
      'nutrition',
      'estimatedTime',
      'difficulty',
    ];

    return validFields.some(field => {
      const value = recipe[field];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && typeof value === 'string' && value.trim().length > 0;
    });
  }

  /**
   * 获取JSON完成度评估
   */
  private getJSONCompletionLevel(content: string): number {
    try {
      const parsed = JSON.parse(content);
      const fields = ['introduction', 'ingredients', 'steps', 'tips', 'nutrition'];
      let completedFields = 0;

      fields.forEach(field => {
        const value = parsed[field];
        if (Array.isArray(value) && value.length > 0) {
          completedFields++;
        } else if (value && typeof value === 'string' && value.trim().length > 0) {
          completedFields++;
        }
      });

      return (completedFields / fields.length) * 100;
    } catch (error) {
      // 如果解析失败，尝试估算完成度
      const braceCount = (content.match(/\{/g) || []).length;
      const closeBraceCount = (content.match(/\}/g) || []).length;

      if (braceCount === 0) return 0;
      return Math.min((closeBraceCount / braceCount) * 100, 95);
    }
  }

  /**
   * 获取菜品做法（智能流式版本）
   */
  public async getRecipeSmartStream(
    dishName: string,
    onChunk: (chunk: string) => void,
    onPartialRecipe: (partialRecipe: any) => void,
    onComplete: (recipe: any) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (!this.canUseAPI()) {
      onError('DeepSeek API 不可用');
      return;
    }

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `你是一个专业的烹饪专家，精通各种中式菜品的制作方法。用户会询问某道菜的做法，请提供详细、准确、实用的烹饪指导。

请严格按照以下 JSON 格式返回菜谱信息，确保JSON格式正确：
{
  "introduction": "菜品的简介和特色",
  "ingredients": [
    {"name": "食材名称", "amount": "用量"},
    {"name": "调料名称", "amount": "用量"}
  ],
  "steps": [
    {
      "description": "详细的制作步骤描述",
      "time": "预计时间（可选）",
      "tips": "小贴士（可选）"
    }
  ],
  "tips": ["烹饪小贴士1", "烹饪小贴士2"],
  "nutrition": "营养价值简介",
  "estimatedTime": "总制作时间",
  "difficulty": "难度等级（简单/中等/困难）"
}

要求：
1. 食材用量要具体明确（如：猪肉500g、生抽2勺等）
2. 制作步骤要详细清晰，便于操作
3. 提供实用的烹饪技巧和注意事项
4. 必须返回标准的 JSON 格式，不要添加任何其他文字
5. 所有文本内容使用中文
6. 确保JSON格式完全正确，每个字段都要有值
7. 请按照字段顺序生成：introduction -> ingredients -> steps -> tips -> nutrition -> estimatedTime -> difficulty`,
      },
      {
        role: 'user',
        content: `请告诉我"${dishName}"的详细做法，包括食材清单、制作步骤、烹饪技巧等。`,
      },
    ];

    const requestBody: DeepSeekRequest = {
      model: this.config.model,
      messages,
      max_tokens: 2000,
      temperature: 0.3,
      top_p: 0.9,
      stream: true,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('响应体不可读');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let lastPartialRecipe: any = null;
      let lastCompletionLevel = 0;
      let lastFieldCount = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                // 流式传输完成
                try {
                  const recipe = JSON.parse(fullContent);
                  onComplete(recipe);
                } catch (parseError) {
                  console.error('解析完整菜谱失败:', parseError);
                  onError('解析菜谱数据失败');
                }
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0]?.delta?.content) {
                  const chunk = parsed.choices[0].delta.content;
                  fullContent += chunk;
                  onChunk(chunk);

                  // 尝试解析部分菜谱
                  const partialRecipe = this.parseStreamingJSON(fullContent);
                  const completionLevel = this.getJSONCompletionLevel(fullContent);
                  const currentFieldCount = this.getCompletedFieldCount(fullContent);
                  const currentGeneratingField = this.getCurrentGeneratingField(fullContent);

                  // 检查是否有新的字段完成
                  if (currentFieldCount > lastFieldCount) {
                    lastFieldCount = currentFieldCount;
                    if (partialRecipe) {
                      console.log(`新字段完成，触发回调: ${currentFieldCount} 个字段`);
                      onPartialRecipe(partialRecipe);
                    }
                  }

                  // 如果解析成功且内容有实质性变化，也触发回调
                  if (partialRecipe && partialRecipe !== lastPartialRecipe) {
                    lastPartialRecipe = partialRecipe;
                    console.log('部分菜谱内容更新，触发回调');
                    onPartialRecipe(partialRecipe);
                  }

                  // 如果完成度有显著提升，也触发回调
                  if (completionLevel > lastCompletionLevel + 5) {
                    lastCompletionLevel = completionLevel;
                    if (partialRecipe) {
                      console.log(`完成度提升到 ${completionLevel}%，触发回调`);
                      onPartialRecipe(partialRecipe);
                    }
                  }

                  // 检查是否有新字段开始生成
                  const newFieldStarted = this.checkNewFieldStarted(fullContent, lastPartialRecipe);
                  if (newFieldStarted && partialRecipe) {
                    console.log('检测到新字段开始生成，触发回调');
                    onPartialRecipe(partialRecipe);
                  }

                  // 定期触发回调以更新状态（每500ms）
                  const now = Date.now();
                  if (!this.lastCallbackTime || now - this.lastCallbackTime > 500) {
                    this.lastCallbackTime = now;
                    if (partialRecipe) {
                      console.log(`定期更新回调，当前生成字段: ${currentGeneratingField}`);
                      onPartialRecipe(partialRecipe);
                    }
                  }
                }
              } catch (parseError) {
                // 忽略解析错误，继续处理下一个chunk
                console.warn('解析流式数据chunk失败:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        onError('API 请求超时，请检查网络连接');
      } else {
        console.error('DeepSeek 智能流式 API 调用失败:', error);
        onError(error instanceof Error ? error.message : '获取菜谱失败');
      }
    }
  }

  /**
   * 获取已完成的字段数量
   */
  private getCompletedFieldCount(content: string): number {
    try {
      const parsed = JSON.parse(content);
      const fields = ['introduction', 'ingredients', 'steps', 'tips', 'nutrition'];
      let completedCount = 0;

      fields.forEach(field => {
        const value = parsed[field];
        if (Array.isArray(value) && value.length > 0) {
          completedCount++;
        } else if (value && typeof value === 'string' && value.trim().length > 0) {
          completedCount++;
        }
      });

      return completedCount;
    } catch (error) {
      // 如果解析失败，尝试通过字符串匹配估算
      const fieldPatterns = [
        /"introduction"\s*:/,
        /"ingredients"\s*:\s*\[/,
        /"steps"\s*:\s*\[/,
        /"tips"\s*:\s*\[/,
        /"nutrition"\s*:/,
      ];

      let count = 0;
      fieldPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          count++;
        }
      });

      return count;
    }
  }

  /**
   * 检查是否有新字段开始生成
   */
  private checkNewFieldStarted(content: string, lastPartialRecipe: any): boolean {
    // 检查是否有新的JSON对象开始
    const newObjectMatch = content.match(/"[^"]*":\s*{/);
    if (newObjectMatch && newObjectMatch[0]) {
      // 检查这个新对象是否与上一个部分菜谱对象不同
      const newObjectContent = content.substring(content.indexOf(newObjectMatch[0]));
      const newPartialRecipe = this.parseStreamingJSON(newObjectContent);
      return newPartialRecipe && newPartialRecipe !== lastPartialRecipe;
    }

    // 检查是否有新的JSON数组开始
    const newArrayMatch = content.match(/"[^"]*":\s*\[/);
    if (newArrayMatch && newArrayMatch[0]) {
      // 检查这个新数组是否与上一个部分菜谱对象不同
      const newArrayContent = content.substring(content.indexOf(newArrayMatch[0]));
      const newPartialRecipe = this.parseStreamingJSON(newArrayContent);
      return newPartialRecipe && newPartialRecipe !== lastPartialRecipe;
    }

    return false;
  }

  /**
   * 获取当前正在生成的字段
   */
  private getCurrentGeneratingField(content: string): string {
    // 检查各个字段的生成状态
    const fieldChecks = [
      { name: 'introduction', pattern: /"introduction"\s*:/ },
      { name: 'ingredients', pattern: /"ingredients"\s*:\s*\[/ },
      { name: 'steps', pattern: /"steps"\s*:\s*\[/ },
      { name: 'tips', pattern: /"tips"\s*:\s*\[/ },
      { name: 'nutrition', pattern: /"nutrition"\s*:/ },
      { name: 'estimatedTime', pattern: /"estimatedTime"\s*:/ },
      { name: 'difficulty', pattern: /"difficulty"\s*:/ },
    ];

    // 找到最后一个开始但可能还未完成的字段
    let lastStartedField = '';
    for (const field of fieldChecks) {
      if (field.pattern.test(content)) {
        lastStartedField = field.name;
      }
    }

    return lastStartedField;
  }

  /**
   * 将文本分割成chunks
   */
  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// 导出单例实例
export const deepseekService = new DeepSeekService();
