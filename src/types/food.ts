// 推荐系统相关枚举类型
export enum WeatherType {
  SUNNY = 'sunny', // 晴天
  CLOUDY = 'cloudy', // 多云
  RAINY = 'rainy', // 雨天
  SNOWY = 'snowy', // 雪天
  HOT = 'hot', // 炎热
  COLD = 'cold', // 寒冷
  HUMID = 'humid', // 潮湿
  DRY = 'dry', // 干燥
}

export enum TimeOfDay {
  BREAKFAST = 'breakfast', // 早餐
  LUNCH = 'lunch', // 午餐
  DINNER = 'dinner', // 晚餐
  SNACK = 'snack', // 零食/夜宵
  ANYTIME = 'anytime', // 任何时候
}

export enum MoodType {
  HAPPY = 'happy', // 开心
  SAD = 'sad', // 难过
  STRESSED = 'stressed', // 压力大
  RELAXED = 'relaxed', // 放松
  ENERGETIC = 'energetic', // 精力充沛
  TIRED = 'tired', // 疲惫
  COMFORT = 'comfort', // 需要安慰
  ADVENTUROUS = 'adventurous', // 想尝试新事物
}

export enum Season {
  SPRING = 'spring', // 春季
  SUMMER = 'summer', // 夏季
  AUTUMN = 'autumn', // 秋季
  WINTER = 'winter', // 冬季
}

export enum CuisineType {
  CHINESE = 'chinese', // 中式
  SICHUAN = 'sichuan', // 川菜
  CANTONESE = 'cantonese', // 粤菜
  HUNAN = 'hunan', // 湘菜
  SHANDONG = 'shandong', // 鲁菜
  JIANGSU = 'jiangsu', // 苏菜
  ZHEJIANG = 'zhejiang', // 浙菜
  FUJIAN = 'fujian', // 闽菜
  ANHUI = 'anhui', // 徽菜
  NORTHEASTERN = 'northeastern', // 东北菜
  WESTERN = 'western', // 西式
  JAPANESE = 'japanese', // 日式
  KOREAN = 'korean', // 韩式
  THAI = 'thai', // 泰式
  INDIAN = 'indian', // 印式
}

// 身体状态枚举
export enum PhysicalState {
  NORMAL = 'normal', // 正常状态
  SICK = 'sick', // 感冒生病 - 推荐清淡粥品
  RECOVERING = 'recovering', // 病后恢复 - 推荐营养丰富
  EXERCISED = 'exercised', // 刚运动完 - 推荐高蛋白
  HANGOVER = 'hangover', // 宿醉 - 推荐解酒、清淡
  INSOMNIA = 'insomnia', // 失眠 - 推荐助眠食物
  PREGNANT = 'pregnant', // 孕期 - 推荐叶酸丰富
  MENSTRUAL = 'menstrual', // 生理期 - 推荐温补、补铁
  PMS = 'pms', // 经前综合征 - 推荐甜食、安慰食物
}

// 身体活动水平枚举
export enum ActivityLevel {
  SEDENTARY = 'sedentary', // 久坐 - 推荐清淡
  LIGHT = 'light', // 轻度活动 - 均衡营养
  MODERATE = 'moderate', // 中度活动 - 增加蛋白质
  INTENSIVE = 'intensive', // 高强度 - 高蛋白高碳水
}

// 工作类型枚举
export enum WorkType {
  MENTAL = 'mental', // 脑力工作 - 补充DHA
  PHYSICAL = 'physical', // 体力工作 - 高能量
  CREATIVE = 'creative', // 创意工作 - 提神醒脑
  NIGHT_SHIFT = 'night_shift', // 夜班 - 易消化
}

// 特殊饮食需求枚举
export enum DietaryRestriction {
  NONE = 'none', // 无限制
  VEGETARIAN = 'vegetarian', // 素食
  VEGAN = 'vegan', // 纯素
  GLUTEN_FREE = 'gluten_free', // 无麸质
  DIABETIC = 'diabetic', // 糖尿病友好
  LOW_SODIUM = 'low_sodium', // 低钠
  LOW_FAT = 'low_fat', // 低脂
  KETO = 'keto', // 生酮饮食
  PALEO = 'paleo', // 原始人饮食
  MEDITERRANEAN = 'mediterranean', // 地中海饮食
}

// 营养信息接口
export interface NutritionInfo {
  calories?: number; // 卡路里
  protein?: number; // 蛋白质(g)
  carbs?: number; // 碳水化合物(g)
  fat?: number; // 脂肪(g)
  fiber?: number; // 纤维(g)
  isHealthy?: boolean; // 是否健康
  isLowCalorie?: boolean; // 是否低卡
  isHighProtein?: boolean; // 是否高蛋白
}

// 扩展的Food接口
export interface Food {
  id: string;
  name: string;
  category?: string;
  categoryColor?: string;
  image?: string;
  backgroundColor?: string;

  // 基础推荐相关属性
  tags?: string[]; // 菜品标签：辣、清爽、温补、下饭等
  suitableWeather?: WeatherType[]; // 适合的天气类型
  suitableTime?: TimeOfDay[]; // 适合的用餐时间
  suitableMood?: MoodType[]; // 适合的心情状态
  season?: Season[]; // 适合的季节
  cuisine?: CuisineType; // 菜系类型
  difficulty?: number; // 制作难度 1-5分
  prepTime?: number; // 准备时间(分钟)
  nutrition?: NutritionInfo; // 营养信息
  spicyLevel?: number; // 辣度等级 0-5
  sweetLevel?: number; // 甜度等级 0-5
  isComfortFood?: boolean; // 是否为安慰食物
  isPopular?: boolean; // 是否为热门菜品
  origin?: string; // 菜品起源/地区
  description?: string; // 详细描述

  // 新增身体状态相关属性
  suitablePhysicalState?: PhysicalState[]; // 适合的身体状态
  benefitsForPhysicalState?: { [key in PhysicalState]?: string }; // 对特定身体状态的益处描述

  // 新增活动水平相关属性
  suitableActivityLevel?: ActivityLevel[]; // 适合的活动水平
  suitableWorkType?: WorkType[]; // 适合的工作类型

  // 新增特殊饮食需求属性
  dietaryRestrictions?: DietaryRestriction[]; // 符合的饮食限制
  allergens?: string[]; // 过敏原信息
  isRecoveryFood?: boolean; // 是否为恢复性食物
  isEnergyBooster?: boolean; // 是否为能量补充食物
  isAntiInflammatory?: boolean; // 是否具有抗炎特性
  isSleepFriendly?: boolean; // 是否有助于睡眠
  isDetoxifying?: boolean; // 是否有排毒作用
}
