<template>
  <div
    id="homePage"
    class="card-face w-full bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative"
  >
    <!-- 顶部状态栏 -->
    <HeaderBar title="今天吃什么" :showBackButton="false" :centerTitle="true" />

    <!-- 内容区域 -->
    <div class="w-full flex flex-col items-center justify-between p-6 relative">
      <!-- 占位区域 -->
      <div ref="canvasContainer" class="flex-1 w-full flex items-center justify-center relative">
        <DishCanvas
          ref="dishCanvasRef"
          :dishList="dishList"
          @animation-complete="onAnimationComplete"
        />
        <div class="w-52 h-52"></div>
      </div>

      <!-- 底部按钮区域 -->
      <div class="mt-6 w-full">
        <ActionButtons
          :disabled="isAnimating"
          :showMainButtons="true"
          @randomFood="$emit('random-food')"
          @addFood="$emit('add-food')"
          @showFoodList="$emit('show-food-list')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import DishCanvas from './DishCanvas.vue';
  import ActionButtons from './ActionButtons.vue';
  import type { Dish } from '@/types';
  import HeaderBar from '@/components/HeaderBar.vue';
  defineProps<{
    dishList: Dish[];
  }>();

  const emit = defineEmits<{
    (e: 'random-food'): void;
    (e: 'add-food'): void;
    (e: 'show-food-list'): void;
    (e: 'selected-dish', dish: Dish): void;
  }>();

  const isAnimating = ref(false);
  const dishCanvasRef = ref<InstanceType<typeof DishCanvas> | null>(null);
  const canvasContainer = ref<HTMLDivElement | null>(null);

  // 启动随机动画
  const startRandomAnimation = async (): Promise<void> => {
    if (dishCanvasRef.value && !isAnimating.value) {
      isAnimating.value = true;
      // 调用Canvas组件的方法启动动画
      await dishCanvasRef.value.startRandomAnimation();
    }
  };

  // 动画完成回调
  const onAnimationComplete = (finalDish: Dish) => {
    emit('selected-dish', finalDish);
    isAnimating.value = false;
  };

  // 将方法暴露给父组件
  defineExpose({
    startRandomAnimation,
  });
</script>
