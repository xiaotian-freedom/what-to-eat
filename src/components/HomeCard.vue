<template>
  <div
    id="homePage"
    class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative flex flex-col w-full h-full"
  >
    <!-- 顶部状态栏 -->
    <HeaderBar
      :title="$t('今天吃什么')"
      :showBackButton="false"
      :centerTitle="true"
      :rightButtons="[
        {
          icon: '🏆',
          onClick: () => (showAchievements = !showAchievements),
          className: 'achievement-button',
        },
        {
          icon: '⚙️',
          onClick: () => router.push('/settings'),
          className: 'settings-button',
        },
      ]"
    />

    <!-- 内容区域 -->
    <div class="flex-1 flex flex-col items-center p-6 overflow-hidden relative">
      <!-- 挑战状态浮动面板 - 可折叠 -->
      <div v-if="!showResult" class="absolute top-4 left-4 z-10">
        <ChallengeStatus ref="challengeStatusRef" />
      </div>

      <!-- 成就BottomSheet -->
      <AchievementBottomSheet :visible="showAchievements" @close="showAchievements = false" />

      <!-- 占位区域 -->
      <div
        ref="canvasContainer"
        class="flex-grow w-full flex items-center justify-center relative"
        @click="handleCanvasClick"
      >
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
          :disabled="isAnimating || !canUseToday"
          :showMainButtons="true"
          @randomFood="handleRandomFood"
          @addFood="$emit('add-food')"
          @showFoodList="$emit('show-food-list')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import DishCanvas from './DishCanvas.vue';
  import ActionButtons from './ActionButtons.vue';
  import ChallengeStatus from './ChallengeStatus.vue';
  import AchievementBottomSheet from './AchievementBottomSheet.vue';
  import type { Dish } from '@/types';
  import HeaderBar from '@/components/HeaderBar.vue';
  import { useFoodStore } from '@/stores';
  import { useChallengeStore } from '@/stores/challenge';
  import { useDevModeStore } from '@/stores/devMode';
  import { showFailToast } from 'vant';

  const { t } = useI18n();
  const router = useRouter();

  const props = defineProps<{
    dishList: Dish[];
    showResult: boolean;
  }>();

  const foodStore = useFoodStore();
  const challengeStore = useChallengeStore();
  const devModeStore = useDevModeStore();

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
  const showAchievements = ref(false);
  const dishCanvasRef = ref<InstanceType<typeof DishCanvas> | null>(null);
  const canvasContainer = ref<HTMLDivElement | null>(null);
  const challengeStatusRef = ref<InstanceType<typeof ChallengeStatus> | null>(null);

  const canUseToday = computed(() => challengeStore.canUseToday);

  // 页面加载时确保数据已经加载
  onMounted(() => {
    foodStore.loadFoodItems();
    challengeStore.loadChallengeData();
  });

  // 处理随机选菜
  const handleRandomFood = async () => {
    if (!canUseToday.value) {
      // 开发模式下显示不同的提示
      if (devModeStore.isUnlimitedUsesEnabled) {
        showFailToast('开发模式下应该可以无限使用，请检查配置');
      } else {
        showFailToast(t('messages.todayLimitReached'));
      }
      return;
    }

    // 通知父组件开始随机选菜
    emit('random-food');
  };

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
    // 使用挑战模式并记录菜品
    const success = challengeStore.useRandomFood(finalDish.name);
    if (!success) {
      showFailToast(t('messages.todayLimitReached'));
      return;
    }

    emit('selected-dish', finalDish);
    isAnimating.value = false;
  };

  // 处理转盘区域点击 - 收起挑战状态面板
  const handleCanvasClick = () => {
    if (challengeStatusRef.value && challengeStatusRef.value.isExpanded) {
      challengeStatusRef.value.toggleExpand();
    }
  };

  // 将方法暴露给父组件
  defineExpose({
    startRandomAnimation,
  });
</script>
