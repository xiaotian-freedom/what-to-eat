import { deepseekService } from './deepseekService';
import { useRecommendationStore } from '@/stores/recommendation';
import { useUserPreferenceStore } from '@/stores/userPreference';
import type {
  Food,
  RecommendationContext,
  RecommendationResult,
  AIRecommendationConfig,
  NetworkStatus,
  RecommendationStrategy,
} from '@/types';
import { NetworkStatus as NetStatus, RecommendationStrategy as Strategy } from '@/types';

// 缓存接口
interface CachedRecommendation {
  result: RecommendationResult;
  timestamp: number;
  context: RecommendationContext;
}

export class HybridRecommendationService {
  private networkStatus: NetworkStatus = NetStatus.CHECKING;
  private cache = new Map<string, CachedRecommendation>();

  private config: AIRecommendationConfig = {
    preferAI: true,
    fallbackToLocal: true,
    timeoutMs: 15000, // 15秒超时，与 DeepSeek 服务一致
    maxRetries: 2,
    cacheResults: true,
    cacheExpiryMs: 2 * 60 * 1000, // 减少到2分钟缓存，增加推荐多样性
  };

  private strategy: RecommendationStrategy = Strategy.HYBRID;

  constructor() {
    this.initNetworkMonitoring();
  }

  /**
   * 初始化网络状态监控
   */
  private initNetworkMonitoring(): void {
    // 初始检查网络状态
    this.updateNetworkStatus();

    // 监听网络状态变化
    window.addEventListener('online', () => {
      console.log('网络已连接');
      this.networkStatus = NetStatus.ONLINE;
    });

    window.addEventListener('offline', () => {
      console.log('网络已断开');
      this.networkStatus = NetStatus.OFFLINE;
    });

    // 定期检查网络状态（每30秒）
    setInterval(() => {
      this.updateNetworkStatus();
    }, 30000);
  }

  /**
   * 更新网络状态
   */
  private updateNetworkStatus(): void {
    this.networkStatus = navigator.onLine ? NetStatus.ONLINE : NetStatus.OFFLINE;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(context: RecommendationContext, foods: Food[]): string {
    const contextStr = JSON.stringify({
      weather: context.currentWeather,
      time: context.currentTime,
      mood: context.userMood,
      season: context.currentSeason,
      temperature: Math.round(context.temperature || 0 / 5) * 5, // 按5度归类
    });

    const foodIds = foods
      .map(f => f.id)
      .sort()
      .join(',');

    // 添加时间戳的部分，以减少重复缓存的可能性
    const hourSlot = Math.floor(Date.now() / (1000 * 60 * 30)); // 每30分钟一个时间段

    return `${contextStr}-${foodIds}-${hourSlot}`;
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cached: CachedRecommendation): boolean {
    const now = Date.now();
    return now - cached.timestamp < this.config.cacheExpiryMs;
  }

  /**
   * 从缓存获取推荐
   */
  private getCachedRecommendation(
    context: RecommendationContext,
    foods: Food[]
  ): RecommendationResult | null {
    if (!this.config.cacheResults) {
      return null;
    }

    const cacheKey = this.generateCacheKey(context, foods);
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached)) {
      console.log('使用缓存的推荐结果');
      return {
        ...cached.result,
        source: cached.result.source === 'ai' ? 'ai' : 'local',
      };
    }

    return null;
  }

  /**
   * 缓存推荐结果
   */
  private cacheRecommendation(
    context: RecommendationContext,
    foods: Food[],
    result: RecommendationResult
  ): void {
    if (!this.config.cacheResults) {
      return;
    }

    const cacheKey = this.generateCacheKey(context, foods);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      context: { ...context },
    });

    // 清理过期缓存
    this.cleanExpiredCache();
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    for (const [key, cached] of this.cache.entries()) {
      if (!this.isCacheValid(cached)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 使用本地算法获取推荐
   */
  private async getLocalRecommendation(
    context: RecommendationContext,
    foods: Food[]
  ): Promise<RecommendationResult> {
    const recommendationStore = useRecommendationStore();
    const userPreferenceStore = useUserPreferenceStore();

    // 更新推荐上下文
    recommendationStore.updateContext(context);

    // 获取本地推荐
    const recommendations = recommendationStore.getRecommendations(foods);

    if (recommendations.length === 0) {
      throw new Error('本地算法未返回推荐结果');
    }

    // 结合用户偏好调整推荐分数
    const adjustedRecs = recommendations.map(rec => {
      const preferenceScore = userPreferenceStore.getPreferenceScore(rec.food);
      const diversityScore = userPreferenceStore.getDiversityScore(rec.food.id);

      // 综合计算最终分数
      const finalScore = rec.score * 0.7 + preferenceScore * 0.2 + diversityScore * 0.1;

      return {
        ...rec,
        score: finalScore,
        confidence: Math.min(rec.confidence + (userPreferenceStore.hasPreferenceData ? 0.2 : 0), 1),
        source: 'local' as const,
      };
    });

    // 使用加权随机选择
    const sortedRecs = adjustedRecs.sort((a, b) => b.score - a.score);
    const topRec = this.getWeightedRandomRecommendation(sortedRecs.slice(0, 5));

    return topRec;
  }

  /**
   * 加权随机选择推荐结果
   */
  private getWeightedRandomRecommendation(
    recommendations: RecommendationResult[]
  ): RecommendationResult {
    if (recommendations.length === 1) return recommendations[0];

    const weights = recommendations.map(rec => rec.score * rec.confidence);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    if (totalWeight === 0) {
      return recommendations[0];
    }

    let random = Math.random() * totalWeight;

    for (let i = 0; i < recommendations.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return recommendations[i];
      }
    }

    return recommendations[0];
  }

  /**
   * 使用 AI 获取推荐（带重试机制）
   */
  private async getAIRecommendationWithRetry(
    context: RecommendationContext,
    foods: Food[],
    retryCount = 0
  ): Promise<RecommendationResult> {
    try {
      console.log(`尝试 AI 推荐 (第${retryCount + 1}次)`);

      // 获取用户最近选择的菜品名称（用于避免重复推荐）
      const userPreferenceStore = useUserPreferenceStore();
      const recentChoiceNames = userPreferenceStore.getRecentChoiceNames(7); // 直接获取最近7天选择的菜品名称

      const result = await Promise.race([
        deepseekService.getAIRecommendation(context, foods, recentChoiceNames),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI 推荐超时')), this.config.timeoutMs)
        ),
      ]);

      return {
        ...result,
        source: 'ai' as const,
      };
    } catch (error) {
      console.error(`AI 推荐失败 (第${retryCount + 1}次):`, error);

      if (retryCount < this.config.maxRetries) {
        // 指数退避：等待时间逐渐增加
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.getAIRecommendationWithRetry(context, foods, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * 设置推荐策略
   */
  public setStrategy(strategy: RecommendationStrategy): void {
    this.strategy = strategy;
    console.log(`推荐策略已切换到: ${strategy}`);
  }

  /**
   * 设置 AI 推荐配置
   */
  public setConfig(config: Partial<AIRecommendationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前网络状态
   */
  public getNetworkStatus(): NetworkStatus {
    return this.networkStatus;
  }

  /**
   * 检查是否可以使用 AI 推荐
   */
  public canUseAI(): boolean {
    return this.networkStatus === NetStatus.ONLINE && deepseekService.canUseAPI();
  }

  /**
   * 清空缓存
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('推荐缓存已清空');
  }

  /**
   * 主推荐方法 - 混合推荐策略
   */
  public async getRecommendation(
    context: RecommendationContext,
    foods: Food[]
  ): Promise<RecommendationResult> {
    if (foods.length === 0) {
      throw new Error('菜品列表为空');
    }

    // 检查缓存
    const cachedResult = this.getCachedRecommendation(context, foods);
    if (cachedResult) {
      return cachedResult;
    }

    let result: RecommendationResult;
    let error: Error | null = null;

    try {
      switch (this.strategy) {
        case Strategy.AI_ONLY:
          result = await this.getAIRecommendationWithRetry(context, foods);
          break;

        case Strategy.LOCAL_ONLY:
          result = await this.getLocalRecommendation(context, foods);
          break;

        case Strategy.HYBRID:
          // 默认混合策略：优先 AI，失败时降级到本地
          if (this.canUseAI() && this.config.preferAI) {
            try {
              console.log('尝试使用 AI 推荐');
              result = await this.getAIRecommendationWithRetry(context, foods);
            } catch (aiError) {
              console.warn('AI 推荐失败，降级到本地算法:', aiError);
              if (this.config.fallbackToLocal) {
                result = await this.getLocalRecommendation(context, foods);
              } else {
                throw aiError;
              }
            }
          } else {
            console.log('使用本地推荐算法');
            result = await this.getLocalRecommendation(context, foods);
          }
          break;

        case Strategy.COMPARE:
          // 对比模式：同时运行两种算法（主要用于调试）
          const [aiResult, localResult] = await Promise.allSettled([
            this.canUseAI()
              ? this.getAIRecommendationWithRetry(context, foods)
              : Promise.reject(new Error('AI 不可用')),
            this.getLocalRecommendation(context, foods),
          ]);

          console.log('AI 推荐结果:', aiResult);
          console.log('本地推荐结果:', localResult);

          // 优先返回 AI 结果
          if (aiResult.status === 'fulfilled') {
            result = aiResult.value;
          } else if (localResult.status === 'fulfilled') {
            result = localResult.value;
          } else {
            throw new Error('所有推荐方法都失败了');
          }
          break;

        default:
          throw new Error(`未知的推荐策略: ${this.strategy}`);
      }

      // 缓存成功的结果
      this.cacheRecommendation(context, foods, result);

      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error('推荐失败');
      console.error('推荐失败:', error);
      throw error;
    }
  }

  /**
   * 获取推荐统计信息
   */
  public getStats(): {
    cacheSize: number;
    networkStatus: NetworkStatus;
    canUseAI: boolean;
    strategy: RecommendationStrategy;
    recentAIRecommendations: string[];
  } {
    return {
      cacheSize: this.cache.size,
      networkStatus: this.networkStatus,
      canUseAI: this.canUseAI(),
      strategy: this.strategy,
      recentAIRecommendations: deepseekService.getRecentRecommendations(),
    };
  }

  /**
   * 重置推荐多样性（清空AI推荐历史）
   */
  public resetDiversity(): void {
    deepseekService.clearRecentRecommendations();
    this.clearCache();
    console.log('推荐多样性已重置');
  }
}

// 导出单例实例
export const hybridRecommendationService = new HybridRecommendationService();
