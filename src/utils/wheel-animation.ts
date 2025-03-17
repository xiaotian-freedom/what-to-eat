import { gsap } from 'gsap';

/**
 * 拨轮动画效果（使用GSAP实现）
 * 优化版：第一个元素旋转到一半时第二个元素开始出现
 * @param currentElement - 当前显示的元素
 * @param nextElement - 即将显示的元素
 * @param callback - 动画完成后的回调函数
 */
export function wheelAnimation(
  currentElement: string,
  nextElement: string,
  callback?: () => void
): void {
  // 创建GSAP时间线
  const tl = gsap.timeline();

  // 添加透视效果到父元素
  const parent = document.querySelector(currentElement)?.parentElement;
  if (parent) {
    gsap.set(parent, {
      perspective: 1000,
    });
  }

  // 设置元素的3D变换样式
  gsap.set([currentElement, nextElement], {
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'hidden',
  });

  // 确保下一个元素准备好但不可见
  gsap.set(nextElement, { rotationY: 90, opacity: 0 });

  // 第一阶段动画：当前元素旋转并淡出
  tl.to(currentElement, {
    rotationY: -90,
    opacity: 0,
    duration: 0.3,
    ease: 'power1.inOut',
    onComplete: () => {
      // 执行回调函数(如果有)
      if (typeof callback === 'function') {
        callback();
      }
    },
  });

  // 第二阶段动画：显示下一个元素，但在第一个元素旋转到一半时开始
  tl.to(nextElement, {
    rotationY: 0,
    opacity: 1,
    duration: 0.3,
    ease: 'power1.inOut',
  }); // 关键点：这个参数使第二个动画在第一个动画完成前0.25秒就开始
}
