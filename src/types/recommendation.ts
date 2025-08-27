import type {
  Food,
  WeatherType,
  TimeOfDay,
  MoodType,
  Season,
  PhysicalState,
  ActivityLevel,
  WorkType,
  DietaryRestriction,
} from './food';

// 推荐上下文接口
export interface RecommendationContext {
  // 环境因素
  currentWeather?: WeatherType; // 当前天气
  currentTime?: TimeOfDay; // 当前时间段
  currentSeason?: Season; // 当前季节
  location?: string; // 用户位置
  temperature?: number; // 当前温度
  humidity?: number; // 当前湿度

  // 用户状态
  userMood?: MoodType; // 用户心情

  // 新增：身体状态相关
  physicalState?: PhysicalState; // 当前身体状态
  activityLevel?: ActivityLevel; // 今日活动水平
  workType?: WorkType; // 当前工作类型

  // 新增：特殊需求
  dietaryRestrictions?: DietaryRestriction[]; // 特殊饮食需求
  allergens?: string[]; // 过敏原
}

// 推荐配置接口
export interface RecommendationConfig {
  // 基础维度权重
  weatherWeight?: number; // 天气权重 0-1
  timeWeight?: number; // 时间权重 0-1
  moodWeight?: number; // 心情权重 0-1
  seasonWeight?: number; // 季节权重 0-1
  preferenceWeight?: number; // 用户偏好权重 0-1
  popularityWeight?: number; // 热门程度权重 0-1
  diversityFactor?: number; // 多样性因子 0-1

  // 新增维度权重
  physicalStateWeight?: number; // 身体状态权重 0-1
  activityLevelWeight?: number; // 活动水平权重 0-1
  workTypeWeight?: number; // 工作类型权重 0-1
  dietaryRestrictionsWeight?: number; // 饮食限制权重 0-1

  maxRecommendations?: number; // 最大推荐数量
}

// 推荐结果接口
export interface RecommendationResult {
  food: Food; // 推荐的菜品
  score: number; // 推荐分数 0-1
  reasons: RecommendationReason[]; // 推荐原因
  confidence: number; // 置信度 0-1
  explanation?: string; // 详细推荐解释（AI 推荐时提供）
  source?: 'ai' | 'local'; // 推荐来源
}

// 推荐原因接口
export interface RecommendationReason {
  type: RecommendationReasonType; // 原因类型
  message: string; // 原因描述
  weight: number; // 该原因的权重
}

// 推荐原因类型枚举
export enum RecommendationReasonType {
  // 基础维度
  WEATHER = 'weather', // 基于天气
  TIME = 'time', // 基于时间
  MOOD = 'mood', // 基于心情
  SEASON = 'season', // 基于季节
  PREFERENCE = 'preference', // 基于用户偏好
  POPULARITY = 'popularity', // 基于热门程度
  HEALTH = 'health', // 基于健康考虑
  VARIETY = 'variety', // 基于多样性
  AI = 'ai', // 基于 AI 推荐

  // 新增维度
  PHYSICAL_STATE = 'physical_state', // 基于身体状态
  ACTIVITY_LEVEL = 'activity_level', // 基于活动水平
  WORK_TYPE = 'work_type', // 基于工作类型
  DIETARY_RESTRICTION = 'dietary_restriction', // 基于饮食限制
}

// 用户偏好数据接口
export interface UserPreference {
  userId?: string; // 用户ID

  // 基础偏好
  favoriteCategories: string[]; // 喜爱的菜品分类
  favoriteCuisines: string[]; // 喜爱的菜系
  favoriteTags: string[]; // 喜爱的标签
  dislikedTags: string[]; // 不喜欢的标签
  spicyTolerance: number; // 辣度承受度 0-5
  sweetTolerance: number; // 甜度承受度 0-5
  healthPriority: number; // 健康优先级 0-1
  adventurousness: number; // 冒险程度 0-1 (愿意尝试新菜品的程度)

  // 新增：身体状态相关偏好
  preferredPhysicalStates?: PhysicalState[]; // 偏好的身体状态食物
  defaultActivityLevel?: ActivityLevel; // 默认活动水平
  workType?: WorkType; // 工作类型

  // 新增：特殊需求
  dietaryRestrictions?: DietaryRestriction[]; // 饮食限制
  allergens?: string[]; // 过敏原列表
  avoidIngredients?: string[]; // 需要避免的食材

  lastUpdated: Date; // 最后更新时间
}

// 用户选择历史接口
export interface UserChoiceHistory {
  foodId: string; // 菜品ID
  foodName: string; // 菜品名称
  selectedAt: Date; // 选择时间
  context: RecommendationContext; // 选择时的上下文
  satisfaction?: number; // 满意度 1-5 (用户反馈)
  tags?: string[]; // 选择时的菜品标签
}

// 天气数据接口
export interface WeatherData {
  temperature: number; // 温度 (摄氏度)
  humidity: number; // 湿度 (百分比)
  condition: string; // 天气状况描述
  weatherType: WeatherType; // 天气类型
  location: string; // 位置
  timestamp: Date; // 数据时间戳
}

// 推荐算法配置
export interface RecommendationAlgorithmConfig {
  // 基础推荐开关
  enableWeatherRecommendation: boolean; // 是否启用天气推荐
  enableTimeRecommendation: boolean; // 是否启用时间推荐
  enableMoodRecommendation: boolean; // 是否启用心情推荐
  enableSeasonRecommendation: boolean; // 是否启用季节推荐
  enablePreferenceRecommendation: boolean; // 是否启用偏好推荐

  // 新增推荐开关
  enablePhysicalStateRecommendation?: boolean; // 是否启用身体状态推荐
  enableActivityLevelRecommendation?: boolean; // 是否启用活动水平推荐
  enableWorkTypeRecommendation?: boolean; // 是否启用工作类型推荐
  enableDietaryRestrictionRecommendation?: boolean; // 是否启用饮食限制推荐

  learningRate: number; // 学习率 0-1
  decayFactor: number; // 衰减因子 0-1 (历史数据的权重衰减)
}

// AI 推荐策略配置
export interface AIRecommendationConfig {
  preferAI: boolean; // 是否优先使用 AI 推荐
  fallbackToLocal: boolean; // AI 失败时是否降级到本地算法
  timeoutMs: number; // AI 请求超时时间（毫秒）
  maxRetries: number; // 最大重试次数
  cacheResults: boolean; // 是否缓存 AI 推荐结果
  cacheExpiryMs: number; // 缓存过期时间（毫秒）
}

// 网络状态枚举
export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CHECKING = 'checking',
}

// 推荐策略枚举
export enum RecommendationStrategy {
  AI_ONLY = 'ai_only', // 仅使用 AI
  LOCAL_ONLY = 'local_only', // 仅使用本地算法
  HYBRID = 'hybrid', // 混合模式：优先 AI，降级到本地
  COMPARE = 'compare', // 对比模式：同时使用两种算法
}
