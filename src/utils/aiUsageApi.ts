import { get, post } from './request';

// 定义AI使用次数相关类型
interface AIUsageInfo {
  daily_uses: number;
  max_daily_uses: number;
  remaining_uses: number;
  last_reset_date?: string | null;
}

interface AIUsageResponse {
  usage_info: AIUsageInfo;
  can_use: boolean;
}

interface ResponseModel {
  code: number;
  msg: string;
  data?: AIUsageResponse | null;
}

// AI使用次数API服务
export class AIUsageApi {
  /**
   * 获取当前用户的AI使用次数信息
   */
  static async getMyAIUsage(): Promise<AIUsageResponse> {
    try {
      const response = await get<ResponseModel>('/api/ai-usage/me');
      if (response.data) {
        return response.data;
      }
      throw new Error('获取AI使用次数信息失败');
    } catch (error) {
      console.error('获取AI使用次数信息失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否可以继续使用AI功能
   */
  static async checkAIUsage(): Promise<AIUsageResponse> {
    try {
      const response = await post<ResponseModel>('/api/ai-usage/check');
      if (response.data) {
        return response.data;
      }
      throw new Error('检查AI使用次数失败');
    } catch (error) {
      console.error('检查AI使用次数失败:', error);
      throw error;
    }
  }

  /**
   * 使用AI功能（增加使用次数）
   */
  static async useAIFeature(): Promise<AIUsageResponse> {
    try {
      const response = await post<ResponseModel>('/api/ai-usage/use');
      if (response.data) {
        return response.data;
      }
      throw new Error('记录AI使用次数失败');
    } catch (error) {
      console.error('记录AI使用次数失败:', error);
      throw error;
    }
  }
}

// 导出便捷函数
export const getMyAIUsage = AIUsageApi.getMyAIUsage;
export const checkAIUsage = AIUsageApi.checkAIUsage;
export const useAIFeature = AIUsageApi.useAIFeature;
