import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Food } from '@/types/food';
import { ColorManager } from '@/utils/ColorManager';
import { getFoods } from '@/utils/foodApi';

export const useFoodStore = defineStore('food', () => {
  // 菜品列表状态
  const foodItems = ref<Food[]>([]);

  // 从API加载菜品数据
  const loadFoodItems = async (): Promise<void> => {
    try {
      // 首先尝试从localStorage加载
      const storedItems = localStorage.getItem('foodItems');
      if (storedItems) {
        foodItems.value = JSON.parse(storedItems);
        // 确保每个菜品都有背景颜色
        foodItems.value.forEach(item => {
          if (!item.backgroundColor) {
            item.backgroundColor = ColorManager.getRandomColor();
          }
        });
      }

      // 然后从API获取最新数据
      await loadFoodsFromAPI();
    } catch (error) {
      console.error('加载菜品数据出错:', error);
      // 如果API调用失败，尝试从localStorage加载
      try {
        const storedItems = localStorage.getItem('foodItems');
        if (storedItems) {
          foodItems.value = JSON.parse(storedItems);
        }
      } catch (localError) {
        console.error('从localStorage加载数据也失败:', localError);
        // 如果都失败了，使用空数组
        foodItems.value = [];
      }
    }
  };

  // 从API获取菜品数据
  const loadFoodsFromAPI = async (): Promise<void> => {
    try {
      const response = await getFoods({ limit: 1000 }); // 获取所有菜品
      const apiFoods = response.items.map(food => ({
        id: food.id.toString(), // 转换为string类型以兼容现有代码
        name: food.name,
        category: food.category,
        image: food.image_url || undefined, // 映射image_url到image，处理null值
        backgroundColor: food.background_color || ColorManager.getRandomColor(),
        tags: food.tags || undefined,
        description: food.description || undefined,
        origin: food.origin || undefined,
        cuisine: food.cuisine ? (food.cuisine as any) : undefined,
        difficulty: food.difficulty,
        prepTime: food.prep_time || undefined,
        spicyLevel: food.spicy_level,
        sweetLevel: food.sweet_level,
        suitableWeather: food.suitable_weather ? (food.suitable_weather as any) : undefined,
        suitableTime: food.suitable_time ? (food.suitable_time as any) : undefined,
        suitableMood: food.suitable_mood ? (food.suitable_mood as any) : undefined,
        season: food.suitable_season ? (food.suitable_season as any) : undefined,
        suitablePhysicalState: food.suitable_physical_state
          ? (food.suitable_physical_state as any)
          : undefined,
        isComfortFood: food.is_comfort_food,
        isPopular: food.is_popular,
        isRecoveryFood: food.is_recovery_food,
        isEnergyBooster: food.is_energy_booster,
        isAntiInflammatory: food.is_anti_inflammatory,
        isSleepFriendly: food.is_sleep_friendly,
        isDetoxifying: food.is_detoxifying,
        dietaryRestrictions: food.dietary_restrictions as any,
        allergens: food.allergens || undefined,
        suitablePostMealFeeling: food.suitable_post_meal_feeling
          ? (food.suitable_post_meal_feeling as any)
          : undefined,
        nutrition: food.nutrition || undefined,
        benefitsForPhysicalState: food.benefits_for_physical_state || undefined,
      }));

      foodItems.value = apiFoods;
      // 保存到localStorage作为缓存
      saveFoodItems();
    } catch (error) {
      console.error('从API获取菜品数据失败:', error);
      throw error;
    }
  };

  // 保存菜品数据到localStorage
  const saveFoodItems = (): void => {
    try {
      localStorage.setItem('foodItems', JSON.stringify(foodItems.value));
    } catch (error) {
      console.error('保存菜品数据出错:', error);
    }
  };

  // 添加新菜品
  const addFood = (food: Omit<Food, 'id'>): Food => {
    const newFood: Food = {
      ...food,
      id: Date.now().toString(),
      backgroundColor: food.backgroundColor || ColorManager.getRandomColor(),
    };
    foodItems.value.unshift(newFood);
    saveFoodItems();
    return newFood;
  };

  // 更新菜品
  const updateFood = (updatedFood: Food): boolean => {
    const index = foodItems.value.findIndex(item => item.id === updatedFood.id);
    if (index !== -1) {
      foodItems.value[index] = updatedFood;
      saveFoodItems();
      return true;
    }
    return false;
  };

  // 删除菜品
  const deleteFood = (id: string): boolean => {
    const index = foodItems.value.findIndex(item => item.id === id);
    if (index !== -1) {
      foodItems.value.splice(index, 1);
      saveFoodItems();
      return true;
    }
    return false;
  };

  // 根据ID获取菜品
  const getFoodById = (id: string): Food | undefined => {
    return foodItems.value.find(item => item.id === id);
  };

  // 根据名称删除菜品
  const deleteFoodByName = (name: string): boolean => {
    const index = foodItems.value.findIndex(item => item.name === name);
    if (index !== -1) {
      foodItems.value.splice(index, 1);
      saveFoodItems();
      return true;
    }
    return false;
  };

  return {
    foodItems,
    loadFoodItems,
    loadFoodsFromAPI,
    addFood,
    updateFood,
    deleteFood,
    getFoodById,
    deleteFoodByName,
  };
});
