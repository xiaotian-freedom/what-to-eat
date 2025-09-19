// 反馈类型枚举（与API保持一致）
export enum FeedbackType {
  SUGGESTION = 'suggestion',
  BUG_REPORT = 'bug_report',
  EXPERIENCE = 'experience',
  OTHER = 'other',
}

// 反馈优先级枚举
export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 反馈状态枚举
export enum FeedbackStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// 平台枚举
export enum Platform {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
  UNKNOWN = 'unknown',
}

// 设备信息接口
export interface DeviceInfo {
  device: string;
  browser: string;
  version: string;
  screenResolution: string;
  viewportSize: string;
  isPWA: string;
  networkType: string;
  memoryInfo: string;
  timezone: string;
  language: string;
  userAgent: string;
}

// 反馈数据接口
export interface FeedbackData {
  type: FeedbackType;
  content: string;
  contact?: string;
  deviceInfo: DeviceInfo;
  timestamp: string;
  userAgent: string;
}

// 反馈提交请求接口（与API保持一致）
export interface FeedbackSubmitRequest {
  title: string;
  content: string;
  feedback_type: FeedbackType;
  priority: FeedbackPriority;
  contact_email?: string;
  contact_phone?: string;
  device_info?: string;
  app_version?: string;
  platform: Platform;
}

// 反馈提交响应接口（与API保持一致）
export interface FeedbackSubmitResponse {
  code: number;
  msg: string;
  data?: {
    feedback: UserFeedback;
    message: string;
  };
}

// 用户反馈接口
export interface UserFeedback {
  id: number;
  user_id: number;
  title: string;
  content: string;
  feedback_type: FeedbackType;
  priority: FeedbackPriority;
  contact_email?: string;
  contact_phone?: string;
  device_info?: string;
  app_version?: string;
  platform: Platform;
  status: FeedbackStatus;
  admin_notes?: string;
  processed_by?: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// 反馈列表项接口
export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  content: string;
  contact?: string;
  deviceInfo: DeviceInfo;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  reply?: string;
  replyAt?: string;
}

// 反馈列表响应接口（与API保持一致）
export interface FeedbackListResponse {
  code: number;
  message: string;
  data?: {
    feedbacks: UserFeedback[];
    total: number;
    page: number;
    page_size: number;
  };
}

// 反馈详情响应接口（与API保持一致）
export interface FeedbackDetailResponse {
  code: number;
  message: string;
  data?: UserFeedback;
}
