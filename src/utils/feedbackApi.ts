import request from './request';
import type {
  FeedbackSubmitRequest,
  FeedbackListResponse,
  FeedbackDetailResponse,
  FeedbackStatus,
  FeedbackType,
} from '@/types/feedback';

// 反馈API基础路径
const FEEDBACK_API_BASE = '/api/feedback';

/**
 * 提交反馈
 * @param data 反馈数据
 * @returns Promise<FeedbackSubmitResponse>
 */
export const submitFeedback = async (data: FeedbackSubmitRequest): Promise<any> => {
  try {
    const response = await request.post(`${FEEDBACK_API_BASE}`, data);
    console.log('response', response);
    return response;
  } catch (error: any) {
    console.error('提交反馈失败:', error);

    // 处理API错误响应
    if (error.response?.data) {
      return {
        code: error.response.status,
        msg: error.response.data.message || '提交失败，请重试',
      };
    }

    // 处理网络错误
    return {
      code: 500,
      msg: '网络连接失败，请检查网络后重试',
    };
  }
};

/**
 * 获取反馈列表
 * @param page 页码
 * @param pageSize 每页数量
 * @returns Promise<FeedbackListResponse>
 */
export const getFeedbackList = async (
  page: number = 1,
  pageSize: number = 10,
  status?: FeedbackStatus,
  type?: FeedbackType
): Promise<FeedbackListResponse> => {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (status) params.status = status;
    if (type) params.type = type;

    const response = await request.get(`${FEEDBACK_API_BASE}`, { params });
    return response.data;
  } catch (error: any) {
    console.error('获取反馈列表失败:', error);

    // 处理API错误响应
    if (error.response?.data) {
      return {
        code: error.response.status,
        message: error.response.data.message || '获取反馈列表失败',
      };
    }

    // 处理网络错误
    return {
      code: 500,
      message: '网络连接失败，请检查网络后重试',
    };
  }
};

/**
 * 获取反馈详情
 * @param feedbackId 反馈ID
 * @returns Promise<FeedbackDetailResponse>
 */
export const getFeedbackDetail = async (feedbackId: number): Promise<FeedbackDetailResponse> => {
  try {
    const response = await request.get(`${FEEDBACK_API_BASE}/${feedbackId}`);
    return response.data;
  } catch (error: any) {
    console.error('获取反馈详情失败:', error);

    // 处理API错误响应
    if (error.response?.data) {
      return {
        code: error.response.status,
        message: error.response.data.message || '获取反馈详情失败',
      };
    }

    // 处理网络错误
    return {
      code: 500,
      message: '网络连接失败，请检查网络后重试',
    };
  }
};

/**
 * 更新反馈状态
 * @param feedbackId 反馈ID
 * @param status 新状态
 * @returns Promise<{ code: number; message: string }>
 */
export const updateFeedbackStatus = async (
  feedbackId: number,
  status: FeedbackStatus
): Promise<{ code: number; message: string }> => {
  try {
    const response = await request.put(`${FEEDBACK_API_BASE}/${feedbackId}`, { status });
    return {
      code: response.status,
      message: '状态更新成功',
    };
  } catch (error: any) {
    console.error('更新反馈状态失败:', error);

    // 处理API错误响应
    if (error.response?.data) {
      return {
        code: error.response.status,
        message: error.response.data.message || '更新失败，请重试',
      };
    }

    // 处理网络错误
    return {
      code: 500,
      message: '网络连接失败，请检查网络后重试',
    };
  }
};
