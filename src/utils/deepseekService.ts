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

  constructor() {
    this.config = {
      apiUrl:
        import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
      model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
      maxTokens: 1000,
      temperature: 0.7,
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
  private createUserQuery(context: RecommendationContext, foods: Food[]): string {
    const contextStr = this.formatContext(context);
    const foodListStr = this.formatFoodList(foods);

    return `当前情况：${contextStr}

可选菜品列表（共${foods.length}道菜）：
${foodListStr}

额外说明：
- 如果现有菜品选择较少或重复性高，请考虑推荐一些经典中餐菜品
- 推荐时请考虑营养搭配、制作难度、季节性等因素
- 尽量避免过于重复的推荐，增加用餐的趣味性

请根据当前情况为我推荐最合适的一道菜。`;
  }

  /**
   * 调用 DeepSeek API
   */
  private async callDeepSeekAPI(
    context: RecommendationContext,
    foods: Food[]
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
        content: this.createUserQuery(context, foods),
      },
    ];

    const requestBody: DeepSeekRequest = {
      model: this.config.model,
      messages,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      top_p: 0.9,
      stream: false,
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
          return aiResponse;
        }

        // 验证返回的菜品ID是否存在于现有列表
        const recommendedFood = foods.find(food => food.id === aiResponse.recommendedFoodId);
        if (!recommendedFood) {
          // 如果找不到对应ID，可能是AI建议了新菜品，标记为扩展推荐
          aiResponse.isExtendedRecommendation = true;
          console.log('AI 推荐了新菜品:', aiResponse.recommendedFoodId);
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
   * 获取 AI 推荐
   */
  public async getAIRecommendation(
    context: RecommendationContext,
    foods: Food[]
  ): Promise<RecommendationResult> {
    if (foods.length === 0) {
      throw new Error('菜品列表为空');
    }

    try {
      const aiResponse = await this.callDeepSeekAPI(context, foods);
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
}

// 导出单例实例
export const deepseekService = new DeepSeekService();
