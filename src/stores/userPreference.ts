import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MoodType, PostMealFeeling, WorkType, DietaryRestriction } from '@/types';
import type { Food, UserPreference, UserChoiceHistory, RecommendationContext } from '@/types';

export const useUserPreferenceStore = defineStore('userPreference', () => {
  // 状态
  const userPreference = ref<UserPreference>({
    userId: '',
    favoriteCategories: [],
    favoriteCuisines: [],
    favoriteTags: [],
    dislikedTags: [],
    spicyTolerance: 2,
    sweetTolerance: 2,
    healthPriority: 0.5,
    adventurousness: 0.5,

    // 新增：身体状态相关偏好
    preferredPhysicalStates: [],
    defaultPostMealFeeling: PostMealFeeling.SATISFYING,
    workType: WorkType.MENTAL,

    // 新增：特殊需求
    dietaryRestrictions: [DietaryRestriction.NONE],
    allergens: [],
    avoidIngredients: [],

    lastUpdated: new Date(),
  });

  const choiceHistory = ref<UserChoiceHistory[]>([]);
  const maxHistorySize = 200; // 最多保存200条历史记录

  // 从localStorage加载用户偏好数据
  const loadUserPreference = () => {
    try {
      const storedPreference = localStorage.getItem('userPreference');
      const storedHistory = localStorage.getItem('userChoiceHistory');

      if (storedPreference) {
        const parsed = JSON.parse(storedPreference);
        userPreference.value = {
          ...userPreference.value,
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
        };
      }

      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        choiceHistory.value = parsedHistory.map((item: UserChoiceHistory) => ({
          ...item,
          selectedAt: new Date(item.selectedAt),
        }));
      }
    } catch (error) {
      console.error('加载用户偏好数据失败:', error);
    }
  };

  // 保存用户偏好数据到localStorage
  const saveUserPreference = () => {
    try {
      userPreference.value.lastUpdated = new Date();
      localStorage.setItem('userPreference', JSON.stringify(userPreference.value));
      localStorage.setItem('userChoiceHistory', JSON.stringify(choiceHistory.value));
    } catch (error) {
      console.error('保存用户偏好数据失败:', error);
    }
  };

  // 记录用户选择
  const recordChoice = (food: Food, context: RecommendationContext, satisfaction?: number) => {
    const choice: UserChoiceHistory = {
      foodId: food.id,
      foodName: food.name,
      selectedAt: new Date(),
      context,
      satisfaction,
      tags: food.tags || [],
    };

    // 添加到历史记录
    choiceHistory.value.unshift(choice);

    // 限制历史记录数量
    if (choiceHistory.value.length > maxHistorySize) {
      choiceHistory.value = choiceHistory.value.slice(0, maxHistorySize);
    }

    // 更新用户偏好
    updatePreferenceFromChoice(food, satisfaction);

    saveUserPreference();
  };

  // 根据选择更新用户偏好
  const updatePreferenceFromChoice = (food: Food, satisfaction?: number) => {
    const learningRate = 0.1; // 学习率

    // 如果有满意度反馈，根据反馈调整偏好
    if (satisfaction !== undefined) {
      const satisfactionWeight = (satisfaction - 3) / 2; // 转换为-1到1的权重

      // 更新分类偏好
      if (food.category) {
        updateArrayPreference(
          userPreference.value.favoriteCategories,
          food.category,
          satisfactionWeight > 0
        );
      }

      // 更新菜系偏好
      if (food.cuisine) {
        updateArrayPreference(
          userPreference.value.favoriteCuisines,
          food.cuisine,
          satisfactionWeight > 0
        );
      }

      // 更新标签偏好
      if (food.tags) {
        food.tags.forEach(tag => {
          if (satisfactionWeight > 0) {
            updateArrayPreference(userPreference.value.favoriteTags, tag, true);
            // 从不喜欢列表中移除
            const dislikedIndex = userPreference.value.dislikedTags.indexOf(tag);
            if (dislikedIndex > -1) {
              userPreference.value.dislikedTags.splice(dislikedIndex, 1);
            }
          } else if (satisfactionWeight < 0) {
            updateArrayPreference(userPreference.value.dislikedTags, tag, true);
            // 从喜欢列表中移除
            const favoriteIndex = userPreference.value.favoriteTags.indexOf(tag);
            if (favoriteIndex > -1) {
              userPreference.value.favoriteTags.splice(favoriteIndex, 1);
            }
          }
        });
      }

      // 更新辣度和甜度承受度
      if (food.spicyLevel !== undefined) {
        userPreference.value.spicyTolerance = Math.max(
          0,
          Math.min(
            5,
            userPreference.value.spicyTolerance +
              satisfactionWeight * learningRate * food.spicyLevel
          )
        );
      }

      if (food.sweetLevel !== undefined) {
        userPreference.value.sweetTolerance = Math.max(
          0,
          Math.min(
            5,
            userPreference.value.sweetTolerance +
              satisfactionWeight * learningRate * food.sweetLevel
          )
        );
      }
    } else {
      // 没有满意度反馈时，仅基于选择频率更新偏好
      if (food.category) {
        updateArrayPreference(userPreference.value.favoriteCategories, food.category, true);
      }

      if (food.cuisine) {
        updateArrayPreference(userPreference.value.favoriteCuisines, food.cuisine, true);
      }

      if (food.tags) {
        food.tags.forEach(tag => {
          updateArrayPreference(userPreference.value.favoriteTags, tag, true);
        });
      }
    }
  };

  // 更新数组偏好的辅助函数
  const updateArrayPreference = (array: string[], item: string, isPositive: boolean) => {
    const index = array.indexOf(item);

    if (isPositive) {
      if (index === -1) {
        array.push(item);
      }
      // 可以考虑增加权重逻辑
    } else {
      if (index > -1) {
        array.splice(index, 1);
      }
    }
  };

  // 设置用户满意度反馈
  const setChoiceSatisfaction = (choiceIndex: number, satisfaction: number) => {
    if (choiceIndex >= 0 && choiceIndex < choiceHistory.value.length) {
      choiceHistory.value[choiceIndex].satisfaction = satisfaction;

      // 根据反馈重新学习偏好
      // 这里可以实现更复杂的反馈学习逻辑
      saveUserPreference();
    }
  };

  // 分析用户偏好趋势
  const analyzePreferenceTrends = (days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentChoices = choiceHistory.value.filter(choice => choice.selectedAt > cutoffDate);

    // 分析最近的选择模式
    const categoryFreq: { [key: string]: number } = {};
    const cuisineFreq: { [key: string]: number } = {};
    const tagFreq: { [key: string]: number } = {};
    const moodChoices: { [key in MoodType]?: number } = {};

    recentChoices.forEach((choice: UserChoiceHistory) => {
      // 统计标签频率
      choice.tags?.forEach((tag: string) => {
        tagFreq[tag] = (tagFreq[tag] || 0) + 1;
      });

      // 统计心情选择
      if (choice.context.userMood) {
        const mood = choice.context.userMood;
        moodChoices[mood] = (moodChoices[mood] || 0) + 1;
      }
    });

    return {
      totalChoices: recentChoices.length,
      categoryFrequency: categoryFreq,
      cuisineFrequency: cuisineFreq,
      tagFrequency: tagFreq,
      moodChoices,
      averageSatisfaction:
        recentChoices
          .filter((c: UserChoiceHistory) => c.satisfaction !== undefined)
          .reduce((sum: number, c: UserChoiceHistory) => sum + (c.satisfaction || 0), 0) /
          recentChoices.filter((c: UserChoiceHistory) => c.satisfaction !== undefined).length || 0,
    };
  };

  // 获取推荐偏好权重
  const getPreferenceScore = (food: Food): number => {
    let score = 0.5; // 基础分数
    let factors = 0;

    // 分类偏好
    if (food.category && userPreference.value.favoriteCategories.includes(food.category)) {
      score += 0.2;
      factors++;
    }

    // 菜系偏好
    if (food.cuisine && userPreference.value.favoriteCuisines.includes(food.cuisine)) {
      score += 0.2;
      factors++;
    }

    // 标签偏好
    if (food.tags) {
      const favoriteTagMatches = food.tags.filter(tag =>
        userPreference.value.favoriteTags.includes(tag)
      ).length;
      const dislikedTagMatches = food.tags.filter(tag =>
        userPreference.value.dislikedTags.includes(tag)
      ).length;

      if (favoriteTagMatches > 0) {
        score += 0.1 * favoriteTagMatches;
        factors++;
      }

      if (dislikedTagMatches > 0) {
        score -= 0.2 * dislikedTagMatches; // 不喜欢的标签权重更高
      }
    }

    // 辣度匹配
    if (food.spicyLevel !== undefined) {
      const spicyDiff = Math.abs(food.spicyLevel - userPreference.value.spicyTolerance);
      score += 0.1 * (1 - spicyDiff / 5); // 差异越小分数越高
      factors++;
    }

    // 甜度匹配
    if (food.sweetLevel !== undefined) {
      const sweetDiff = Math.abs(food.sweetLevel - userPreference.value.sweetTolerance);
      score += 0.1 * (1 - sweetDiff / 5);
      factors++;
    }

    // 健康优先级
    if (food.nutrition?.isHealthy && userPreference.value.healthPriority > 0.5) {
      score += 0.1 * userPreference.value.healthPriority;
      factors++;
    }

    // 新增：身体状态相关偏好
    if (food.suitablePhysicalState && userPreference.value.preferredPhysicalStates) {
      const physicalStateMatches = food.suitablePhysicalState.filter(state =>
        userPreference.value.preferredPhysicalStates?.includes(state)
      ).length;
      if (physicalStateMatches > 0) {
        score += 0.15 * physicalStateMatches;
        factors++;
      }
    }

    // 新增：餐后感受匹配
    if (food.suitablePostMealFeeling && userPreference.value.defaultPostMealFeeling) {
      const feelingMatches = food.suitablePostMealFeeling.includes(
        userPreference.value.defaultPostMealFeeling
      );
      if (feelingMatches) {
        score += 0.1;
        factors++;
      }
    }

    // 新增：工作类型匹配
    if (food.suitableWorkType && userPreference.value.workType) {
      const workTypeMatches = food.suitableWorkType.includes(userPreference.value.workType);
      if (workTypeMatches) {
        score += 0.1;
        factors++;
      }
    }

    // 新增：饮食限制检查（这是硬性要求，违反会大幅减分）
    if (
      userPreference.value.dietaryRestrictions &&
      userPreference.value.dietaryRestrictions.length > 0
    ) {
      const userRestrictions = userPreference.value.dietaryRestrictions.filter(
        r => r !== DietaryRestriction.NONE
      );
      if (userRestrictions.length > 0 && food.dietaryRestrictions) {
        // 检查是否符合用户的饮食限制
        const isCompliant = userRestrictions.every(restriction =>
          food.dietaryRestrictions?.includes(restriction)
        );
        if (!isCompliant) {
          score -= 0.5; // 不符合饮食限制，大幅减分
        } else {
          score += 0.1; // 符合饮食限制，小幅加分
          factors++;
        }
      }
    }

    // 新增：过敏原检查（这是硬性要求，违反会严重减分）
    if (userPreference.value.allergens && userPreference.value.allergens.length > 0) {
      if (food.allergens) {
        const hasAllergen = userPreference.value.allergens.some(allergen =>
          food.allergens?.includes(allergen)
        );
        if (hasAllergen) {
          score -= 0.8; // 含有过敏原，严重减分
        }
      }
    }

    // 新增：需要避免的食材检查
    if (userPreference.value.avoidIngredients && userPreference.value.avoidIngredients.length > 0) {
      const hasAvoidIngredient = userPreference.value.avoidIngredients.some(
        ingredient =>
          food.name.includes(ingredient) ||
          food.description?.includes(ingredient) ||
          food.tags?.some(tag => tag.includes(ingredient))
      );
      if (hasAvoidIngredient) {
        score -= 0.3; // 含有需要避免的食材，中度减分
      }
    }

    return Math.max(0, Math.min(1, score));
  };

  // 获取最近选择的菜品IDs
  const getRecentChoiceIds = (days: number = 7): string[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return choiceHistory.value
      .filter((choice: UserChoiceHistory) => choice.selectedAt > cutoffDate)
      .map((choice: UserChoiceHistory) => choice.foodId);
  };

  // 获取最近选择的菜品名称
  const getRecentChoiceNames = (days: number = 7): string[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return choiceHistory.value
      .filter((choice: UserChoiceHistory) => choice.selectedAt > cutoffDate)
      .map((choice: UserChoiceHistory) => choice.foodName);
  };

  // 计算多样性分数（避免重复推荐）
  const getDiversityScore = (foodId: string, recentDays: number = 7): number => {
    const recentChoices = getRecentChoiceIds(recentDays);
    const recentCount = recentChoices.filter(id => id === foodId).length;

    // 最近选择越多，多样性分数越低
    return Math.max(0, 1 - recentCount * 0.3);
  };

  // 计算属性
  const hasPreferenceData = computed(() => {
    return (
      choiceHistory.value.length > 0 ||
      userPreference.value.favoriteTags.length > 0 ||
      userPreference.value.favoriteCategories.length > 0
    );
  });

  const preferenceInsights = computed(() => {
    return analyzePreferenceTrends();
  });

  // 手动更新偏好设置
  const updatePreferenceSettings = (updates: Partial<UserPreference>) => {
    userPreference.value = {
      ...userPreference.value,
      ...updates,
      lastUpdated: new Date(),
    };
    saveUserPreference();
  };

  // 清除历史数据
  const clearHistory = () => {
    choiceHistory.value = [];
    userPreference.value = {
      userId: '',
      favoriteCategories: [],
      favoriteCuisines: [],
      favoriteTags: [],
      dislikedTags: [],
      spicyTolerance: 2,
      sweetTolerance: 2,
      healthPriority: 0.5,
      adventurousness: 0.5,

      // 新增：身体状态相关偏好
      preferredPhysicalStates: [],
      defaultPostMealFeeling: PostMealFeeling.SATISFYING,
      workType: WorkType.MENTAL,

      // 新增：特殊需求
      dietaryRestrictions: [DietaryRestriction.NONE],
      allergens: [],
      avoidIngredients: [],

      lastUpdated: new Date(),
    };
    saveUserPreference();
  };

  return {
    // 状态
    userPreference,
    choiceHistory,

    // 计算属性
    hasPreferenceData,
    preferenceInsights,

    // 方法
    loadUserPreference,
    recordChoice,
    setChoiceSatisfaction,
    getPreferenceScore,
    getDiversityScore,
    getRecentChoiceIds,
    getRecentChoiceNames,
    analyzePreferenceTrends,
    updatePreferenceSettings,
    clearHistory,
  };
});
