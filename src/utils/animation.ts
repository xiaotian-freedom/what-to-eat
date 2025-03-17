import type { AnimatedDish, EasingFunction } from '../types';

// 缓动函数库
export const easingFunctions = {
  // 线性
  linear: (t: number): number => t,
  
  // 缓入
  easeIn: (t: number, power: number = 2): number => Math.pow(t, power),
  
  // 缓出
  easeOut: (t: number, power: number = 2): number => 1 - Math.pow(1 - t, power),
  
  // 缓入缓出
  easeInOut: (t: number, power: number = 2): number => {
    return t < 0.5
      ? Math.pow(2 * t, power) / 2
      : 1 - Math.pow(2 * (1 - t), power) / 2;
  }
};

// 应用缓动函数
export function applyEasing(progress: number, easingType: number, power: number): number {
  switch (easingType) {
    case 0: return easingFunctions.linear(progress);
    case 1: return easingFunctions.easeOut(progress, power);
    case 2: return easingFunctions.easeInOut(progress, power);
    default: return easingFunctions.easeOut(progress, power);
  }
}

// 使用requestAnimationFrame模拟setTimeout
export function rafTimeout(callback: () => void, delay: number): number {
  const startTime = performance.now();

  function checkTime(timestamp: number) {
    const elapsedTime = timestamp - startTime;
    if (elapsedTime >= delay) {
      callback();
    } else {
      rafId = requestAnimationFrame(checkTime);
    }
  }

  let rafId = requestAnimationFrame(checkTime);
  return rafId;
}

// 清除基于requestAnimationFrame的timeout
export function clearRafTimeout(rafId: number): void {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
}

// 创建单个菜品动画对象
export function createDish(dish: any, canvasWidth: number, canvasHeight: number): AnimatedDish {
  return {
    dish: dish,
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    scale: 0,
    rotation: 0,
    opacity: 0,
    targetX: (Math.random() * 2 - 1) * (canvasWidth * 0.4),
    targetY: (Math.random() * 2 - 1) * (canvasHeight * 0.4),
    targetRotation: (Math.random() * 20 - 10), // 减小旋转角度范围
    stage: 0, // 0:出现, 1:回弹, 2:飞出
    startTime: performance.now(),
    stageTime: performance.now(),
    // 添加缓动函数参数
    easing: {
      type: Math.floor(Math.random() * 3), // 随机选择缓动类型
      power: 2 + Math.random() * 1 // 缓动强度
    }
  };
} 