import type { components } from '@/types/api';
import { get } from './request';

// 定义菜品类型
type Food = components['schemas']['Food'];

// 定义API返回的类型
interface FoodList {
  items: Food[];
  total: number;
}

// 获取菜品列表
export async function getFoods(params?: {
  skip?: number;
  limit?: number;
  category?: string | null;
  cuisine?: string | null;
  difficulty_min?: number | null;
  difficulty_max?: number | null;
  spicy_level_min?: number | null;
  spicy_level_max?: number | null;
  sweet_level_min?: number | null;
  sweet_level_max?: number | null;
  is_popular?: boolean | null;
  is_comfort_food?: boolean | null;
  tags?: string[] | null;
  weather?: string | null;
  mood?: string | null;
  season?: string | null;
  physical_state?: string | null;
  dietary_restriction?: string | null;
}): Promise<FoodList> {
  try {
    const response = await get<{ data: FoodList }>('/foods/', params);
    return response.data;
  } catch (error) {
    console.error('获取菜品列表失败:', error);
    throw error;
  }
}

// 获取菜品详情
export async function getFoodById(foodId: number): Promise<Food> {
  try {
    const response = await get<{ data: Food }>(`/foods/${foodId}`);
    return response.data;
  } catch (error) {
    console.error('获取菜品详情失败:', error);
    throw error;
  }
}

// 获取菜品分类
export async function getFoodCategories(params?: { skip?: number; limit?: number }) {
  try {
    const response = await get('/foods/categories', params);
    return response.data;
  } catch (error) {
    console.error('获取菜品分类失败:', error);
    throw error;
  }
}

// 获取菜系
export async function getCuisines(params?: { skip?: number; limit?: number }) {
  try {
    const response = await get('/foods/cuisines', params);
    return response.data;
  } catch (error) {
    console.error('获取菜系失败:', error);
    throw error;
  }
}
