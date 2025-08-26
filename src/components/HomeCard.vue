<template>
  <div
    id="homePage"
    class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative flex flex-col w-full h-full"
  >
    <!-- 顶部状态栏 -->
    <HeaderBar :title="$t('今天吃什么')" :showBackButton="false" :centerTitle="true">
      <!-- 右侧菜单按钮 -->
      <template #rightContent>
        <button
          @click.stop="toggleMenu"
          class="text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0"
        >
          <img src="@/assets/icons/menu.svg" class="w-5 h-5" />
        </button>
      </template>
    </HeaderBar>

    <!-- 弹出菜单 - 移到根级别 -->
    <MenuPopover :visible="showMenu" @close="showMenu = false" @menu-click="handleMenuClick" />

    <!-- 内容区域 -->
    <div class="flex-1 flex flex-col items-center p-6 overflow-hidden relative">
      <!-- 成就BottomSheet -->
      <AchievementBottomSheet :visible="showAchievements" @close="showAchievements = false" />

      <!-- 每日挑战BottomSheet -->
      <ChallengeBottomSheet :visible="showChallenge" @close="showChallenge = false" />

      <!-- 推荐面板 - 底部弹出 -->
      <RecommendationBottomSheet
        :visible="showRecommendation"
        :maxRecommendations="3"
        @close="showRecommendation = false"
        @foodSelected="handleRecommendationSelected"
        @recommendationsUpdated="onRecommendationsUpdated"
      />

      <!-- 占位区域 -->
      <div
        ref="canvasContainer"
        class="w-full flex items-center justify-center relative transition-all duration-300 flex-grow"
      >
        <DishCanvas
          ref="dishCanvasRef"
          :dishList="combinedDishList"
          :targetDish="recommendedDish || undefined"
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
  import AchievementBottomSheet from './AchievementBottomSheet.vue';
  import ChallengeBottomSheet from './ChallengeBottomSheet.vue';
  import RecommendationBottomSheet from './RecommendationBottomSheet.vue';
  import MenuPopover from './MenuPopover.vue';
  import type { Dish, RecommendationResult } from '@/types';
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
    (e: 'show-result'): void;
  }>();

  const isAnimating = ref(false);
  const showAchievements = ref(false);
  const showChallenge = ref(false);
  const showRecommendation = ref(false);
  const showMenu = ref(false);
  const dishCanvasRef = ref<InstanceType<typeof DishCanvas> | null>(null);
  const canvasContainer = ref<HTMLDivElement | null>(null);
  const recommendedDish = ref<Dish | null>(null);

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
    // 检查是否是推荐菜品的动画完成
    const isRecommendedDish =
      recommendedDish.value && finalDish.name === recommendedDish.value.name;

    if (isRecommendedDish) {
      // 推荐菜品动画完成，不需要再次记录挑战数据（已在推荐时记录）
      // 发送选择事件
      emit('selected-dish', finalDish);

      // 清除推荐菜品状态
      recommendedDish.value = null;
    } else {
      // 正常随机选择流程
      const success = challengeStore.useRandomFood(finalDish.name);
      if (!success) {
        showFailToast(t('messages.todayLimitReached'));
        return;
      }
      emit('selected-dish', finalDish);
    }

    isAnimating.value = false;

    // 动画完成后显示结果页面
    emit('show-result');
  };

  // 切换推荐面板显示/隐藏
  const toggleRecommendation = () => {
    showRecommendation.value = !showRecommendation.value;
  };

  // 处理推荐选择
  const handleRecommendationSelected = async (recommendation: RecommendationResult) => {
    // 将推荐的Food转换为Dish格式
    const selectedDish: Dish = {
      name: recommendation.food.name,
      image: recommendation.food.image || '',
      desc: recommendation.food.category || '智能推荐',
      backgroundColor: recommendation.food.backgroundColor || '#667eea',
    };

    // 设置为推荐菜品
    recommendedDish.value = selectedDish;

    if (dishCanvasRef.value && !isAnimating.value) {
      isAnimating.value = true;
      try {
        // 直接传递菜品参数，确保目标菜品正确设置
        await dishCanvasRef.value.showTargetDish(selectedDish);
        // 动画完成后会自动调用 onAnimationComplete
      } catch (error) {
        console.error('显示推荐菜品动画失败:', error);
        isAnimating.value = false;
      }
    }

    // 隐藏推荐面板
    showRecommendation.value = false;
  };

  // 推荐更新回调 - 现在主要用于日志记录
  const onRecommendationsUpdated = (recommendations: RecommendationResult[]) => {
    if (recommendations.length > 0) {
      console.log(`获得${recommendations.length}个推荐`, recommendations);
    }
  };

  // 切换菜单显示状态
  const toggleMenu = () => {
    showMenu.value = !showMenu.value;
  };

  // 处理菜单点击事件
  const handleMenuClick = (action: string) => {
    switch (action) {
      case 'recommendation':
        // 智能推荐：切换推荐面板显示状态
        toggleRecommendation();
        break;
      case 'challenge':
        // 每日挑战：显示挑战面板
        showChallenge.value = true;
        break;
      case 'achievements':
        // 成就系统：显示成就面板
        showAchievements.value = true;
        break;
      case 'settings':
        // 系统设置：跳转到设置页面
        router.push('/settings');
        break;
    }
  };

  // 将方法暴露给父组件
  defineExpose({
    startRandomAnimation,
  });
</script>
