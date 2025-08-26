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

  // 新增推荐相关属性
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
}
