<template>
  <canvas ref="canvas" class="absolute left-0 top-0 w-full h-full z-5 pointer-events-none"></canvas>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
  import type { Dish, DishAnimation, CachedDishImage } from '@/types';

  const props = defineProps<{
    dishList: Dish[];
  }>();

  const emit = defineEmits<{
    (e: 'animation-complete', dish: Dish): void;
  }>();

  const canvas = ref<HTMLCanvasElement | null>(null);
  let ctx: CanvasRenderingContext2D | null = null;

  // 状态变量
  const isRunningAnimation = ref(false);
  const selectedDish = ref<Dish | null>(null);
  const dishes = ref<DishAnimation[]>([]);
  let animationFrameId: number | null = null;
  let animationTimer: number | null = null;

  // 图像缓存
  const dishImages = ref<Record<string, CachedDishImage>>({});
  const imagesLoaded = ref(0);

  // 初始化Canvas
  const initCanvas = () => {
    if (!canvas.value) return;

    const resizeCanvas = () => {
      if (!canvas.value) return;

      const container = canvas.value.parentElement;
      if (container) {
        canvas.value.width = container.clientWidth;
        canvas.value.height = container.clientHeight;
      }
    };

    // 初始调整大小
    resizeCanvas();

    // 窗口大小变化时调整Canvas大小
    window.addEventListener('resize', resizeCanvas);

    // 获取绘图上下文
    ctx = canvas.value.getContext('2d', { alpha: true });
  };

  // 预加载所有图片
  const preloadAllImages = () => {
    props.dishList.forEach(dish => {
      if (!dish.image) {
        // 无图片情况直接创建颜色块缓存
        const cachedImg = createCachedDishImage(dish);
        dishImages.value[dish.name] = {
          original: null,
          cached: cachedImg,
        };
        imagesLoaded.value++;
        return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        const cachedImg = createCachedDishImage(dish, img);
        dishImages.value[dish.name] = {
          original: img,
          cached: cachedImg,
        };

        imagesLoaded.value++;
      };

      img.onerror = () => {
        console.warn(`无法加载图片: ${dish.name}`);
        imagesLoaded.value++;

        // 图片加载失败时使用颜色块代替
        const cachedImg = createCachedDishImage(dish);
        dishImages.value[dish.name] = {
          original: null,
          cached: cachedImg,
        };
      };

      img.src = dish.image;
    });
  };

  // 创建缓存的菜品图像
  const createCachedDishImage = (dish: Dish, img?: HTMLImageElement): HTMLCanvasElement => {
    const cacheCanvas = document.createElement('canvas');
    const size = 120;
    cacheCanvas.width = size;
    cacheCanvas.height = size;
    const cacheCtx = cacheCanvas.getContext('2d');

    if (!cacheCtx) return cacheCanvas;

    // 绘制圆形裁剪区域
    cacheCtx.beginPath();
    cacheCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    cacheCtx.closePath();
    cacheCtx.clip();

    if (img) {
      // 有图片时，绘制图片
      // 计算图像缩放和位置
      const scale = Math.max(size / img.width, size / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;

      // 绘制图像
      cacheCtx.drawImage(img, x, y, scaledWidth, scaledHeight);
    } else {
      // 无图片时，绘制背景颜色和文字
      cacheCtx.fillStyle = dish.backgroundColor || '#4A5568';
      cacheCtx.fillRect(0, 0, size, size);

      // 添加文字（菜品名称首字母）
      cacheCtx.fillStyle = '#FFFFFF';
      cacheCtx.font = 'bold 60px sans-serif';
      cacheCtx.textAlign = 'center';
      cacheCtx.textBaseline = 'middle';
      cacheCtx.fillText(dish.name.charAt(0), size / 2, size / 2);
    }

    // 添加圆形边框
    cacheCtx.strokeStyle = 'rgba(255,255,255,0.8)';
    cacheCtx.lineWidth = 2;
    cacheCtx.beginPath();
    cacheCtx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    cacheCtx.stroke();

    return cacheCanvas;
  };

  // 创建单个菜品对象
  const createDish = (dish: Dish): DishAnimation => {
    if (!canvas.value) {
      throw new Error('Canvas not initialized');
    }

    return {
      dish: dish,
      x: canvas.value.width / 2,
      y: canvas.value.height / 2,
      scale: 0,
      rotation: 0,
      opacity: 0,
      targetX: (Math.random() * 2 - 1) * (canvas.value.width * 0.4),
      targetY: (Math.random() * 2 - 1) * (canvas.value.height * 0.4),
      targetRotation: Math.random() * 20 - 10,
      stage: 0,
      startTime: performance.now(),
      stageTime: performance.now(),
      easing: {
        type: Math.floor(Math.random() * 3),
        power: 2 + Math.random() * 1,
      },
    };
  };

  // 使用requestAnimationFrame模拟setTimeout
  const rafTimeout = (callback: () => void, delay: number): number => {
    const startTime = performance.now();

    function checkTime(timestamp: number) {
      const elapsedTime = timestamp - startTime;
      if (elapsedTime >= delay) {
        callback();
      } else {
        requestAnimationFrame(checkTime);
      }
    }

    return requestAnimationFrame(checkTime);
  };

  // 缓动函数库
  const easingFunctions = {
    linear: (t: number) => t,
    easeIn: (t: number, power = 2) => Math.pow(t, power),
    easeOut: (t: number, power = 2) => 1 - Math.pow(1 - t, power),
    easeInOut: (t: number, power = 2) => {
      return t < 0.5 ? Math.pow(2 * t, power) / 2 : 1 - Math.pow(2 * (1 - t), power) / 2;
    },
  };

  // 应用缓动函数
  const applyEasing = (progress: number, easingType: number, power: number): number => {
    switch (easingType) {
      case 0:
        return easingFunctions.linear(progress);
      case 1:
        return easingFunctions.easeOut(progress, power);
      case 2:
        return easingFunctions.easeInOut(progress, power);
      default:
        return easingFunctions.easeOut(progress, power);
    }
  };

  // 绘制优化的菜品
  const drawDishOptimized = (dish: DishAnimation) => {
    if (!ctx || dish.opacity <= 0) return;

    // 保存当前上下文状态
    ctx.save();

    // 设置模糊效果
    let blurAmount = 0;

    if (dish.stage === 0) {
      // 刚出现时模糊值从3px减少到1px
      const elapsed = performance.now() - dish.stageTime;
      const progress = Math.min(1.0, elapsed / 300);
      blurAmount = 3 - (3 - 1) * progress;
    } else if (dish.stage === 1) {
      // 从1px线性减少到0px (完全清晰)
      const elapsed = performance.now() - dish.stageTime;
      const progress = Math.min(1.0, elapsed / 200);
      blurAmount = 1 - progress;
    } else if (dish.stage === 2) {
      // 飞出时保持轻微模糊，从0px到1px
      const elapsed = performance.now() - dish.stageTime;
      const progress = Math.min(1.0, elapsed / 1500);
      blurAmount = progress;
    } else if (dish.stage === 3) {
      // 最终菜品特效 - 完全移除模糊效果，保持清晰
      blurAmount = 0;
    }

    // 应用模糊效果
    if (blurAmount > 0) {
      ctx.filter = `blur(${blurAmount}px)`;
    } else {
      ctx.filter = 'none';
    }

    // 设置透明度
    ctx.globalAlpha = dish.opacity;

    // 变换坐标系到菜品中心
    ctx.translate(dish.x, dish.y);
    ctx.rotate((dish.rotation * Math.PI) / 180);
    ctx.scale(dish.scale, dish.scale);

    // 使用缓存的图像
    if (dishImages.value[dish.dish.name] && dishImages.value[dish.dish.name].cached) {
      const cachedImg = dishImages.value[dish.dish.name].cached;
      if (cachedImg) {
        // 居中绘制
        ctx.drawImage(cachedImg, -cachedImg.width / 2, -cachedImg.height / 2);
      }
    } else {
      // 没有缓存图像时绘制备用图像
      const size = 60;
      // 使用菜品背景颜色或默认颜色
      ctx.fillStyle = dish.dish.backgroundColor || '#f0f0f0';
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // 添加首字母文本
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(dish.dish.name.charAt(0), 0, 0);
    }

    // 恢复上下文状态
    ctx.restore();
  };

  // Canvas动画循环
  const animateCanvas = (timestamp: number) => {
    // 如果动画已经停止，直接返回
    if (!isRunningAnimation.value) return;

    // 清除Canvas - 仅在有菜品需要绘制时清除
    if (!ctx || dishes.value.length === 0) return;

    ctx.clearRect(0, 0, canvas.value?.width || 0, canvas.value?.height || 0);

    // 处理动画的菜品数量上限
    const maxProcessPerFrame = 10;
    const processCount = Math.min(dishes.value.length, maxProcessPerFrame);

    // 遍历当前帧要处理的菜品
    for (let i = 0; i < processCount; i++) {
      const dish = dishes.value[i];
      const elapsed = timestamp - dish.stageTime;

      // 根据阶段更新属性
      switch (dish.stage) {
        case 0: // 出现阶段
          if (elapsed < 300) {
            const progress = elapsed / 300;
            const easedProgress = applyEasing(progress, dish.easing.type, dish.easing.power);
            dish.scale = 1.2 * easedProgress;
            dish.rotation = -3 * easedProgress;
            dish.opacity = easedProgress;
          } else {
            dish.scale = 1.2;
            dish.rotation = -3;
            dish.opacity = 1;
            dish.stage = 1;
            dish.stageTime = timestamp;
          }
          break;

        case 1: // 回弹阶段
          if (elapsed < 200) {
            const progress = elapsed / 200;
            const easedProgress = applyEasing(progress, dish.easing.type, dish.easing.power);
            dish.scale = 1.2 + (1.0 - 1.2) * easedProgress;
            dish.rotation = -3 + 3 * easedProgress;
          } else {
            dish.scale = 1.0;
            dish.rotation = 0;
            dish.stage = 2;
            dish.stageTime = timestamp;
          }
          break;

        case 2: // 飞出阶段
          if (elapsed < 1500) {
            const progress = elapsed / 1500;
            const easedProgress = applyEasing(progress, 1, 1.5);
            dish.x = (canvas.value?.width || 0) / 2 + dish.targetX * easedProgress;
            dish.y = (canvas.value?.height || 0) / 2 + dish.targetY * easedProgress;
            dish.scale = 1.0 + (0.8 - 1.0) * progress;
            dish.rotation = dish.targetRotation * progress;
            dish.opacity = Math.max(0, 1 - progress * 1.2);
          } else {
            dish.completed = true;
          }
          break;

        case 3: // 最终菜品特效
          if (elapsed < 500) {
            // 第一阶段：回到中心
            const progress = elapsed / 500;
            const easedProgress = easingFunctions.easeOut(progress, 1.5);
            dish.x = dish.x + ((canvas.value?.width || 0) / 2 - dish.x) * easedProgress;
            dish.y = dish.y + ((canvas.value?.height || 0) / 2 - dish.y) * easedProgress;
            dish.scale = dish.scale + (1.3 - dish.scale) * easedProgress;
            dish.rotation = dish.rotation * (1 - easedProgress);
            dish.opacity = Math.min(1, dish.opacity + easedProgress);
          } else if (elapsed < 1500) {
            // 第二阶段：放大旋转效果
            const progress = (elapsed - 500) / 1000;
            // 使用正弦函数创建脉动效果
            const pulse = 1.3 + 0.2 * Math.sin(progress * Math.PI * 3);
            // 旋转也有轻微的摆动
            const rotateWave = 5 * Math.sin(progress * Math.PI * 4);

            dish.scale = pulse;
            dish.rotation = rotateWave;
            dish.opacity = 1;
          } else if (elapsed < 2500) {
            // 第三阶段：逐渐停止并淡出
            const progress = (elapsed - 1500) / 1000;
            // 逐渐减弱振幅
            const decayAmp = 0.2 * (1 - progress);
            const pulse = 1.3 + decayAmp * Math.sin(progress * Math.PI * 5);
            // 旋转也逐渐停止
            const rotateWave = 5 * (1 - progress) * Math.sin(progress * Math.PI * 6);

            dish.scale = pulse;
            dish.rotation = rotateWave;
            // 最后200ms开始淡出
            if (progress > 0.8) {
              dish.opacity = 1 - (progress - 0.8) * 5; // 5倍速淡出
            }
          } else {
            dish.completed = true;
            // 完成最终动画，通知父组件
            if (selectedDish.value) {
              emit('animation-complete', selectedDish.value);
            }

            // 清除动画帧
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
          break;
      }

      // 绘制菜品
      if (!dish.completed) {
        drawDishOptimized(dish);
      }
    }

    // 移除已完成的菜品
    dishes.value = dishes.value.filter(dish => !dish.completed);

    // 如果还有活跃菜品，继续动画循环
    if (dishes.value.length > 0) {
      animationFrameId = requestAnimationFrame(animateCanvas);
    } else {
      isRunningAnimation.value = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  };

  // 开始随机动画
  const startRandomAnimation = (): Promise<void> => {
    return new Promise(resolve => {
      // 如果动画已经在运行，不再重新启动
      if (isRunningAnimation.value) {
        resolve();
        return;
      }

      // 清除所有活跃菜品
      dishes.value = [];
      isRunningAnimation.value = true;

      // 停止当前可能正在进行的动画
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // 清除之前可能存在的定时器
      if (animationTimer) {
        cancelAnimationFrame(animationTimer);
        animationTimer = null;
      }

      // 重新设计：使用一个统一的时间控制器
      let animationStartTime = performance.now();
      let animationTotalTime = 4000; // 总动画时间
      let lastDishTime = animationStartTime;
      let dishesToAdd = 20; // 总共会生成的菜品数量
      let addedDishes = 0;
      let finalDishSet = false; // 标记是否已设置最终菜品

      // 主动画循环
      const mainAnimationLoop = (timestamp: number) => {
        // 计算动画进度 (0-1)
        const elapsedTime = timestamp - animationStartTime;
        const progress = Math.min(1.0, elapsedTime / animationTotalTime);

        // 如果还有菜品需要生成且未超过总时间
        if (addedDishes < dishesToAdd && progress < 0.95) {
          // 计算当前应该的生成间隔
          let interval;

          if (progress < 0.3) {
            // 开始缓慢加速 (从800ms到150ms)
            const startProgress = progress / 0.3;
            interval = 800 - (800 - 150) * Math.pow(startProgress, 2.5);
          } else if (progress < 0.7) {
            // 中间高速阶段 (稳定在80-120ms)
            interval = 100;
          } else {
            // 结束缓慢减速 (从120ms到500ms)
            const endProgress = (progress - 0.7) / 0.25;
            interval = 100 + (500 - 100) * Math.pow(endProgress, 2);
          }

          // 检查是否应该生成新菜品
          if (timestamp - lastDishTime >= interval) {
            // 随机选择一个菜品
            let randomIndex = Math.floor(Math.random() * props.dishList.length);
            // 避免连续显示相同菜品
            if (
              addedDishes > 0 &&
              dishes.value.length > 0 &&
              dishes.value[dishes.value.length - 1].dish.name === props.dishList[randomIndex].name
            ) {
              randomIndex = (randomIndex + 1) % props.dishList.length;
            }

            const dish = props.dishList[randomIndex];
            selectedDish.value = dish; // 保存当前展示的菜品

            // 创建新菜品动画对象
            dishes.value.push(createDish(dish));

            // 更新状态
            lastDishTime = timestamp;
            addedDishes++;
          }
        }

        // 如果动画完成且还没设置最终菜品，找出最后一个活跃菜品
        if (progress >= 1 && !finalDishSet) {
          // 查找最后添加的菜品作为最终结果
          if (dishes.value.length > 0) {
            // 找到最后一个未完成的菜品
            let lastActiveIndex = -1;
            for (let i = dishes.value.length - 1; i >= 0; i--) {
              if (!dishes.value[i].completed) {
                lastActiveIndex = i;
                break;
              }
            }

            if (lastActiveIndex >= 0) {
              // 将最后一个活跃菜品设置为最终态
              dishes.value[lastActiveIndex].stage = 3;
              dishes.value[lastActiveIndex].stageTime = timestamp;
              finalDishSet = true; // 标记已设置最终菜品
            } else {
              // 如果没有活跃菜品，创建一个新的最终菜品
              if (selectedDish.value) {
                const finalDish = createDish(selectedDish.value);
                finalDish.stage = 3;
                finalDish.stageTime = timestamp;
                dishes.value.push(finalDish);
                finalDishSet = true;
              }
            }
          } else if (selectedDish.value) {
            // 如果没有菜品但有选中的菜品，创建一个新的
            const finalDish = createDish(selectedDish.value);
            finalDish.stage = 3;
            finalDish.stageTime = timestamp;
            dishes.value.push(finalDish);
            finalDishSet = true;
          } else {
            // 如果既没有菜品也没有选中的菜品，直接结束
            emit('animation-complete', props.dishList[0]); // 默认使用第一个菜品
            finalDishSet = true;
            isRunningAnimation.value = false;
            resolve();
            return;
          }
        }

        // 调用动画更新函数
        animateCanvas(timestamp);

        // 如果动画仍在进行，继续循环
        if (isRunningAnimation.value && !finalDishSet) {
          requestAnimationFrame(mainAnimationLoop);
        } else if (finalDishSet) {
          // 最终菜品已设置，等待最终动画完成
          animationTimer = rafTimeout(() => {
            isRunningAnimation.value = false;
            resolve();
          }, 3000); // 给最终动画留足够时间
        } else {
          // 动画已完成
          isRunningAnimation.value = false;
          resolve();
        }
      };

      // 启动主动画循环
      requestAnimationFrame(mainAnimationLoop);
    });
  };

  // 清除Canvas
  const clearCanvas = () => {
    if (ctx && canvas.value) {
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    }
  };

  // 组件挂载时初始化
  onMounted(() => {
    initCanvas();
    preloadAllImages();
  });

  // 组件卸载前清理
  onBeforeUnmount(() => {
    // 停止所有动画
    isRunningAnimation.value = false;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    if (animationTimer) {
      cancelAnimationFrame(animationTimer);
    }

    // 移除事件监听器
    window.removeEventListener('resize', () => {});
  });

  // 监听dishList变化，重新预加载图片
  watch(
    () => props.dishList,
    () => {
      preloadAllImages();
    },
    { deep: true }
  );

  // 导出方法以供父组件调用
  defineExpose({
    startRandomAnimation,
    clearCanvas,
  });
</script>

<style scoped>
  canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    pointer-events: none;
  }
</style>
