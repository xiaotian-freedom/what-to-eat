import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Food } from '@/types/food';
import { ColorManager } from '@/utils/ColorManager';

export const useFoodStore = defineStore('food', () => {
  // 菜品列表状态
  const foodItems = ref<Food[]>([]);

  // 从localStorage加载菜品数据
  const loadFoodItems = (): void => {
    try {
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
    } catch (error) {
      console.error('加载菜品数据出错:', error);
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
    addFood,
    updateFood,
    deleteFood,
    getFoodById,
    deleteFoodByName,
  };
});
