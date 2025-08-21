<template>
  <div
    class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-sans flex justify-center items-center px-5 w-full h-screen"
  >
    <!-- 卡片容器 -->
    <div class="card-container" :class="{ flipped: showResult }">
      <!-- 主页面 -->
      <HomeCard
        ref="homeCardRef"
        :dishList="dishList"
        :showResult="showResult"
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
</template>

<script setup lang="ts">
  import { ref, onMounted, useTemplateRef } from 'vue';
  import { useI18n } from 'vue-i18n';
  import HomeCard from '@/components/HomeCard.vue';
  import ResultCard from '@/components/ResultCard.vue';
  import type { Dish } from '@/types';
  import { dishList } from '@/data/dishList';
  import { useRouter } from 'vue-router';
  import { showFailToast, showSuccessToast } from 'vant';
  import { useChallengeStore } from '@/stores/challenge';

  const { t } = useI18n();
  const router = useRouter();
  const challengeStore = useChallengeStore();

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
    router.push('/add-food');
  };

  // 显示菜品列表
  const showFoodList = () => {
    router.push('/food-management');
  };

  // 再选一次
  const chooseAgain = () => {
    showResult.value = false;
    selectedDish.value = null;

    // 移除GPU加速类
    document.body.classList.remove('gpu-accelerated');
  };

  // 分享结果
  const shareResult = async () => {
    // 准备分享数据
    const shareData = {
      title: t('app.name'),
      text: t('messages.shareText'),
      url: window.location.href,
    };

    // 检查是否支持 Web Share API
    if (navigator.share && navigator.canShare) {
      try {
        // 检查是否可以分享当前数据
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          showSuccessToast(t('messages.shareSuccess'));
          return;
        }
      } catch (error) {
        console.log('Web Share API error:', error);
        // 用户取消分享或分享失败，回退到复制链接
      }
    }

    // 回退到复制链接
    fallbackToCopy();
  };

  // 回退到复制链接的方法
  const fallbackToCopy = () => {
    // 尝试使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          showSuccessToast(t('messages.copySuccess'));
        })
        .catch(error => {
          console.log('Clipboard API failed:', error);
          // 如果 Clipboard API 失败，尝试传统方法
          fallbackToLegacyCopy();
        });
    } else {
      // 不支持 Clipboard API，使用传统方法
      fallbackToLegacyCopy();
    }
  };

  // 传统的复制方法（兼容性更好）
  const fallbackToLegacyCopy = () => {
    try {
      // 创建临时文本区域
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        showSuccessToast(t('messages.copySuccess'));
      } else {
        showFailToast(t('messages.copyFailed'));
      }
    } catch (error) {
      console.log('Legacy copy failed:', error);
      showFailToast(t('messages.copyFailed'));
    }
  };

  onMounted(() => {
    // 添加GPU加速类
    document.body.classList.add('gpu-accelerated');
    // 加载挑战数据
    challengeStore.loadChallengeData();
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
    height: 70vh;
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
