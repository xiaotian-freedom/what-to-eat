import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Food } from '@/types/food';

// 收藏项接口
interface FavoriteItem {
  foodId: string;
  foodName: string;
  category?: string;
  image?: string;
  backgroundColor?: string;
  addedAt: Date;
  note?: string; // 收藏备注
}

export const useFavoriteStore = defineStore('favorite', () => {
  // 收藏列表
  const favorites = ref<FavoriteItem[]>([]);

  // 计算属性
  const favoriteCount = computed(() => favorites.value.length);
  const hasFavorites = computed(() => favorites.value.length > 0);

  // 从localStorage加载收藏数据
  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('userFavorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        favorites.value = parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
      }
    } catch (error) {
      console.error('加载收藏数据失败:', error);
    }
  };

  // 保存收藏数据到localStorage
  const saveFavorites = () => {
    try {
      localStorage.setItem('userFavorites', JSON.stringify(favorites.value));
    } catch (error) {
      console.error('保存收藏数据失败:', error);
    }
  };

  // 添加收藏
  const addFavorite = (food: Food, note?: string) => {
    const existingIndex = favorites.value.findIndex(item => item.foodId === food.id);

    if (existingIndex === -1) {
      const favoriteItem: FavoriteItem = {
        foodId: food.id,
        foodName: food.name,
        category: food.category,
        image: food.image,
        backgroundColor: food.backgroundColor || '#ec4899',
        addedAt: new Date(),
        note,
      };

      favorites.value.unshift(favoriteItem); // 添加到开头
      saveFavorites();
      return true;
    }
    return false; // 已经收藏过了
  };

  // 移除收藏
  const removeFavorite = (foodId: string) => {
    const index = favorites.value.findIndex(item => item.foodId === foodId);
    if (index > -1) {
      favorites.value.splice(index, 1);
      saveFavorites();
      return true;
    }
    return false;
  };

  // 检查是否已收藏
  const isFavorite = (foodId: string) => {
    return favorites.value.some(item => item.foodId === foodId);
  };

  // 更新收藏备注
  const updateFavoriteNote = (foodId: string, note: string) => {
    const item = favorites.value.find(item => item.foodId === foodId);
    if (item) {
      item.note = note;
      saveFavorites();
      return true;
    }
    return false;
  };

  // 清空所有收藏
  const clearAllFavorites = () => {
    favorites.value = [];
    saveFavorites();
  };

  // 获取收藏的菜品ID列表
  const getFavoriteFoodIds = () => {
    return favorites.value.map(item => item.foodId);
  };

  return {
    // 状态
    favorites,

    // 计算属性
    favoriteCount,
    hasFavorites,

    // 方法
    loadFavorites,
    saveFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    updateFavoriteNote,
    clearAllFavorites,
    getFavoriteFoodIds,
  };
});
