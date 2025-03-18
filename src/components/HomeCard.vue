<template>
  <div
    id="homePage"
    class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative flex flex-col w-full h-full"
  >
    <!-- 顶部状态栏 -->
    <HeaderBar title="今天吃什么" :showBackButton="false" :centerTitle="true" />

    <!-- 内容区域 -->
    <div class="flex-1 flex flex-col items-center p-6 overflow-hidden">
      <!-- 占位区域 -->
      <div ref="canvasContainer" class="flex-grow w-full flex items-center justify-center relative">
        <DishCanvas
          ref="dishCanvasRef"
          :dishList="combinedDishList"
          @animation-complete="onAnimationComplete"
        />
        <div class="w-52 h-52"></div>
      </div>

      <!-- 底部按钮区域 - 固定在底部 -->
      <div class="mt-auto pt-6 w-full">
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
  import { ref, computed, onMounted } from 'vue';
  import DishCanvas from './DishCanvas.vue';
  import ActionButtons from './ActionButtons.vue';
  import type { Dish } from '@/types';
  import HeaderBar from '@/components/HeaderBar.vue';
  import { useFoodStore } from '@/stores';

  const props = defineProps<{
    dishList: Dish[];
  }>();

  const foodStore = useFoodStore();

  // 优先使用 store 中的数据，如果为空才使用 dishList
  const combinedDishList = computed(() => {
    if (foodStore.foodItems.length > 0) {
      // 将 Food 类型转换为 Dish 类型
      return foodStore.foodItems.map(food => ({
        name: food.name,
        image: food.image || '',
        desc: food.category || '美味佳肴',
        backgroundColor: food.backgroundColor || food.categoryColor || '#4A5568',
      }));
    } else {
      // 如果 store 中没有数据，使用默认 dishList
      return props.dishList;
    }
  });

  const emit = defineEmits<{
    (e: 'random-food'): void;
    (e: 'add-food'): void;
    (e: 'show-food-list'): void;
    (e: 'selected-dish', dish: Dish): void;
  }>();

  const isAnimating = ref(false);
  const dishCanvasRef = ref<InstanceType<typeof DishCanvas> | null>(null);
  const canvasContainer = ref<HTMLDivElement | null>(null);

  // 页面加载时确保数据已经加载
  onMounted(() => {
    foodStore.loadFoodItems();
  });

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
