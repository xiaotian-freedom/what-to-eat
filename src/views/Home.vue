<template>
  <div class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen font-sans">
    <!-- 设备模拟框架 -->
    <div class="flex justify-center items-center p-4 w-screen h-screen device-container">
      <!-- 卡片容器 -->
      <div class="card-container" :class="{ flipped: showResult }">
        <!-- 主页面 -->
        <HomeCard
          ref="homeCardRef"
          :dishList="dishList"
          @random-food="randomFood"
          @add-food="addFood"
          @show-food-list="showFoodList"
          @selected-dish="selectedDish = $event"
        />

        <!-- 结果页面 -->
        <ResultCard
          :selectedDish="selectedDish"
          @choose-again="chooseAgain"
          @share-result="shareResult"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, useTemplateRef } from 'vue';
  import HomeCard from '@/components/HomeCard.vue';
  import ResultCard from '@/components/ResultCard.vue';
  import type { Dish } from '@/types';
  import { dishList } from '@/data/dishList';

  const selectedDish = ref<Dish | null>(null);
  const showResult = ref(false);
  const homeCardRef = useTemplateRef('homeCardRef');

  // 随机选菜
  const randomFood = async () => {
    if (homeCardRef.value) {
      // 调用HomePage组件中的方法启动菜品选择动画
      await homeCardRef.value.startRandomAnimation();

      // 动画完成后，显示结果
      showResult.value = true;
    }
  };

  // 添加菜品
  const addFood = () => {
    window.location.href = 'add-food.html';
  };

  // 显示菜品列表
  const showFoodList = () => {
    window.location.href = 'food-management.html';
  };

  // 再选一次
  const chooseAgain = () => {
    showResult.value = false;
    selectedDish.value = null;

    // 移除GPU加速类
    document.body.classList.remove('gpu-accelerated');
  };

  // 分享结果
  const shareResult = () => {
    if (selectedDish.value) {
      // 简单的分享功能，可以根据需要扩展
      alert(`分享: 今天我要吃 ${selectedDish.value.name}！`);
      // 这里可以添加实际的分享逻辑
    }
  };

  onMounted(() => {
    // 添加GPU加速类
    document.body.classList.add('gpu-accelerated');
  });
</script>

<style scoped>
  /* GPU加速的类 */
  :deep(.gpu-accelerated) {
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -ms-transform: translateZ(0);
    -o-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -ms-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-perspective: 1000;
    -moz-perspective: 1000;
    -ms-perspective: 1000;
    perspective: 1000;
  }

  /* 保留卡片翻转相关的样式 */
  .card-container {
    transition: transform 0.6s;
    transform-style: preserve-3d;
    position: relative;
    width: 100%;
    max-width: 400px;
    height: 600px;
  }

  .card-container.flipped {
    transform: rotateY(180deg);
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
  }

  #resultPage {
    transform: rotateY(180deg);
  }
</style>
