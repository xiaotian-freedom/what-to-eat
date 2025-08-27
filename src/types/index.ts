// 导出推荐系统相关类型
export * from './food';
export * from './recommendation';

// 导入 Food 类型用于 DishAnimation
import type { Food } from './food';

// 菜品数据接口
export interface Dish {
  name: string;
  image?: string;
  desc: string;
  backgroundColor?: string;
}

// 菜品动画对象接口
export interface DishAnimation {
  dish: Food;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  targetX: number;
  targetY: number;
  targetRotation: number;
  stage: number;
  startTime: number;
  stageTime: number;
  easing: {
    type: number;
    power: number;
  };
  completed?: boolean;
}

// 缓存的菜品图像接口
export interface CachedDishImage {
  original: HTMLImageElement | null;
  cached: HTMLCanvasElement | null;
}
