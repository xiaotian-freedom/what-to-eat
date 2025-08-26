import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { WeatherType, TimeOfDay, MoodType, Season, RecommendationReasonType } from '@/types';
import type {
  Food,
  RecommendationContext,
  RecommendationConfig,
  RecommendationResult,
  RecommendationReason,
  WeatherData,
} from '@/types';

export const useRecommendationStore = defineStore('recommendation', () => {
  // 状态
  const currentContext = ref<RecommendationContext>({});
  const recommendationConfig = ref<RecommendationConfig>({
    weatherWeight: 0.2,
    timeWeight: 0.25,
    moodWeight: 0.15,
    seasonWeight: 0.15,
    preferenceWeight: 0.15,
    popularityWeight: 0.1,
    diversityFactor: 0.3,
    maxRecommendations: 5,
  });
  const currentWeatherData = ref<WeatherData | null>(null);

  // 计算当前季节
  const getCurrentSeason = (): Season => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return Season.SPRING;
    if (month >= 6 && month <= 8) return Season.SUMMER;
    if (month >= 9 && month <= 11) return Season.AUTUMN;
    return Season.WINTER;
  };

  // 计算当前时间段
  const getCurrentTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return TimeOfDay.BREAKFAST;
    if (hour >= 10 && hour < 14) return TimeOfDay.LUNCH;
    if (hour >= 14 && hour < 18) return TimeOfDay.SNACK;
    if (hour >= 18 && hour < 22) return TimeOfDay.DINNER;
    return TimeOfDay.SNACK;
  };

  // 更新推荐上下文
  const updateContext = (context: Partial<RecommendationContext>) => {
    currentContext.value = {
      ...currentContext.value,
      ...context,
      currentSeason: context.currentSeason || getCurrentSeason(),
      currentTime: context.currentTime || getCurrentTimeOfDay(),
    };
  };

  // 更新天气数据
  const updateWeatherData = (weatherData: WeatherData) => {
    currentWeatherData.value = weatherData;
    updateContext({
      currentWeather: weatherData.weatherType,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      location: weatherData.location,
    });
  };

  // 计算天气匹配分数
  const calculateWeatherScore = (
    food: Food
  ): { score: number; reasons: RecommendationReason[] } => {
    const reasons: RecommendationReason[] = [];
    let score = 0.5; // 基础分数

    if (!food.suitableWeather || !currentContext.value.currentWeather) {
      return { score, reasons };
    }

    const isWeatherSuitable = food.suitableWeather.includes(currentContext.value.currentWeather);
    if (isWeatherSuitable) {
      score = 0.9;
      reasons.push({
        type: RecommendationReasonType.WEATHER,
        message: `适合${getWeatherDescription(currentContext.value.currentWeather)}天气`,
        weight: recommendationConfig.value.weatherWeight || 0.2,
      });
    }

    // 温度相关的额外判断
    const temp = currentContext.value.temperature;
    if (temp !== undefined) {
      if (temp > 30 && food.tags?.includes('清爽')) {
        score += 0.2;
        reasons.push({
          type: RecommendationReasonType.WEATHER,
          message: '炎热天气，推荐清爽菜品',
          weight: 0.1,
        });
      } else if (temp < 10 && food.tags?.includes('温补')) {
        score += 0.2;
        reasons.push({
          type: RecommendationReasonType.WEATHER,
          message: '寒冷天气，推荐温补菜品',
          weight: 0.1,
        });
      }
    }

    return { score: Math.min(score, 1), reasons };
  };

  // 计算时间匹配分数
  const calculateTimeScore = (food: Food): { score: number; reasons: RecommendationReason[] } => {
    const reasons: RecommendationReason[] = [];
    let score = 0.5;

    if (!food.suitableTime || !currentContext.value.currentTime) {
      return { score, reasons };
    }

    const isTimeSuitable =
      food.suitableTime.includes(currentContext.value.currentTime) ||
      food.suitableTime.includes(TimeOfDay.ANYTIME);

    if (isTimeSuitable) {
      score = 0.9;
      reasons.push({
        type: RecommendationReasonType.TIME,
        message: `适合${getTimeDescription(currentContext.value.currentTime)}`,
        weight: recommendationConfig.value.timeWeight || 0.25,
      });
    }

    return { score, reasons };
  };

  // 计算心情匹配分数
  const calculateMoodScore = (food: Food): { score: number; reasons: RecommendationReason[] } => {
    const reasons: RecommendationReason[] = [];
    let score = 0.5;

    if (!food.suitableMood || !currentContext.value.userMood) {
      return { score, reasons };
    }

    const isMoodSuitable = food.suitableMood.includes(currentContext.value.userMood);
    if (isMoodSuitable) {
      score = 0.9;
      reasons.push({
        type: RecommendationReasonType.MOOD,
        message: `适合${getMoodDescription(currentContext.value.userMood)}时享用`,
        weight: recommendationConfig.value.moodWeight || 0.15,
      });
    }

    // 安慰食物的特殊处理
    if (
      currentContext.value.userMood === MoodType.SAD ||
      currentContext.value.userMood === MoodType.STRESSED
    ) {
      if (food.isComfortFood) {
        score += 0.3;
        reasons.push({
          type: RecommendationReasonType.MOOD,
          message: '安慰食物，帮助缓解压力',
          weight: 0.2,
        });
      }
    }

    return { score: Math.min(score, 1), reasons };
  };

  // 计算季节匹配分数
  const calculateSeasonScore = (food: Food): { score: number; reasons: RecommendationReason[] } => {
    const reasons: RecommendationReason[] = [];
    let score = 0.5;

    if (!food.season || !currentContext.value.currentSeason) {
      return { score, reasons };
    }

    const isSeasonSuitable = food.season.includes(currentContext.value.currentSeason);
    if (isSeasonSuitable) {
      score = 0.9;
      reasons.push({
        type: RecommendationReasonType.SEASON,
        message: `${getSeasonDescription(currentContext.value.currentSeason)}应季菜品`,
        weight: recommendationConfig.value.seasonWeight || 0.15,
      });
    }

    return { score, reasons };
  };

  // 计算热门程度分数
  const calculatePopularityScore = (
    food: Food
  ): { score: number; reasons: RecommendationReason[] } => {
    const reasons: RecommendationReason[] = [];
    let score = 0.5;

    if (food.isPopular) {
      score = 0.8;
      reasons.push({
        type: RecommendationReasonType.POPULARITY,
        message: '热门推荐菜品',
        weight: recommendationConfig.value.popularityWeight || 0.1,
      });
    }

    return { score, reasons };
  };

  // 主推荐算法
  const getRecommendations = (foods: Food[]): RecommendationResult[] => {
    const results: RecommendationResult[] = [];

    // 检查是否有天气数据
    const hasWeatherData = currentWeatherData.value !== null;

    foods.forEach(food => {
      const weatherResult = hasWeatherData
        ? calculateWeatherScore(food)
        : { score: 0.5, reasons: [] };
      const timeResult = calculateTimeScore(food);
      const moodResult = calculateMoodScore(food);
      const seasonResult = calculateSeasonScore(food);
      const popularityResult = calculatePopularityScore(food);

      // 动态调整权重：如果没有天气数据，将天气权重分配给其他因素
      let weatherWeight = recommendationConfig.value.weatherWeight || 0.2;
      let timeWeight = recommendationConfig.value.timeWeight || 0.25;
      let moodWeight = recommendationConfig.value.moodWeight || 0.15;
      let seasonWeight = recommendationConfig.value.seasonWeight || 0.15;
      let popularityWeight = recommendationConfig.value.popularityWeight || 0.1;
      const preferenceWeight = recommendationConfig.value.preferenceWeight || 0.15;

      if (!hasWeatherData) {
        // 将天气权重平均分配给时间、心情和季节因素
        const redistribution = weatherWeight / 3;
        timeWeight += redistribution;
        moodWeight += redistribution;
        seasonWeight += redistribution;
        weatherWeight = 0;
      }

      // 计算加权总分
      const totalScore =
        weatherResult.score * weatherWeight +
        timeResult.score * timeWeight +
        moodResult.score * moodWeight +
        seasonResult.score * seasonWeight +
        popularityResult.score * popularityWeight +
        0.5 * preferenceWeight; // 偏好分数暂时设为0.5

      // 合并所有推荐原因（排除空的天气原因）
      const allReasons = [
        ...(hasWeatherData ? weatherResult.reasons : []),
        ...timeResult.reasons,
        ...moodResult.reasons,
        ...seasonResult.reasons,
        ...popularityResult.reasons,
      ];

      // 计算置信度（基于匹配的因素数量）
      const confidence = allReasons.length > 0 ? Math.min(allReasons.length / 3, 1) : 0.3;

      results.push({
        food,
        score: totalScore,
        reasons: allReasons,
        confidence,
      });
    });

    // 按分数排序并返回前N个
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, recommendationConfig.value.maxRecommendations || 5);
  };

  // 获取单个推荐（用于随机选择时的智能推荐）
  const getSmartRandomRecommendation = (foods: Food[]): RecommendationResult | null => {
    const recommendations = getRecommendations(foods);
    if (recommendations.length === 0) return null;

    // 根据分数进行加权随机选择
    const weightedChoices = recommendations.map(rec => ({
      ...rec,
      weight: rec.score * rec.confidence,
    }));

    const totalWeight = weightedChoices.reduce((sum, choice) => sum + choice.weight, 0);
    let random = Math.random() * totalWeight;

    for (const choice of weightedChoices) {
      random -= choice.weight;
      if (random <= 0) {
        return choice;
      }
    }

    return recommendations[0]; // 备选返回最高分的
  };

  // 辅助函数 - 获取天气描述
  const getWeatherDescription = (weather: WeatherType): string => {
    const descriptions = {
      [WeatherType.SUNNY]: '晴',
      [WeatherType.CLOUDY]: '多云',
      [WeatherType.RAINY]: '雨',
      [WeatherType.SNOWY]: '雪',
      [WeatherType.HOT]: '炎热',
      [WeatherType.COLD]: '寒冷',
      [WeatherType.HUMID]: '潮湿',
      [WeatherType.DRY]: '干燥',
    };
    return descriptions[weather] || weather;
  };

  // 辅助函数 - 获取时间描述
  const getTimeDescription = (time: TimeOfDay): string => {
    const descriptions = {
      [TimeOfDay.BREAKFAST]: '早餐时间',
      [TimeOfDay.LUNCH]: '午餐时间',
      [TimeOfDay.DINNER]: '晚餐时间',
      [TimeOfDay.SNACK]: '零食时间',
      [TimeOfDay.ANYTIME]: '任何时候',
    };
    return descriptions[time] || time;
  };

  // 辅助函数 - 获取心情描述
  const getMoodDescription = (mood: MoodType): string => {
    const descriptions = {
      [MoodType.HAPPY]: '开心',
      [MoodType.SAD]: '难过',
      [MoodType.STRESSED]: '压力大',
      [MoodType.RELAXED]: '放松',
      [MoodType.ENERGETIC]: '精力充沛',
      [MoodType.TIRED]: '疲惫',
      [MoodType.COMFORT]: '需要安慰',
      [MoodType.ADVENTUROUS]: '想尝试新事物',
    };
    return descriptions[mood] || mood;
  };

  // 辅助函数 - 获取季节描述
  const getSeasonDescription = (season: Season): string => {
    const descriptions = {
      [Season.SPRING]: '春季',
      [Season.SUMMER]: '夏季',
      [Season.AUTUMN]: '秋季',
      [Season.WINTER]: '冬季',
    };
    return descriptions[season] || season;
  };

  // 计算属性
  const isRecommendationReady = computed(() => {
    return currentContext.value.currentSeason && currentContext.value.currentTime;
  });

  return {
    // 状态
    currentContext,
    recommendationConfig,
    currentWeatherData,

    // 计算属性
    isRecommendationReady,

    // 方法
    updateContext,
    updateWeatherData,
    getRecommendations,
    getSmartRandomRecommendation,
    getCurrentSeason,
    getCurrentTimeOfDay,
  };
});
