// 菜品数据接口
export interface Dish {
  name: string;
  image: string;
  desc: string;
}

// 菜品动画对象接口
export interface DishAnimation {
  dish: Dish;
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
  original: HTMLImageElement;
  cached: HTMLCanvasElement | null;
}
