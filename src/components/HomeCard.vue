<template>
  <div
    id="homePage"
    class="card-face rounded-3xl shadow-xl overflow-hidden border-8 relative flex flex-col w-full h-full theme-transition"
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      boxShadow: '0 10px 25px -3px var(--color-shadow)',
    }"
  >
    <!-- 顶部状态栏 -->
    <HeaderBar :title="$t('今天吃什么')" :showBackButton="false" :centerTitle="true">
      <!-- 右侧菜单按钮 -->
      <template #rightContent>
        <button
          ref="menuButtonRef"
          @click.stop="toggleMenu"
          class="p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0"
          :style="{
            color: 'var(--color-primary)',
            backgroundColor: 'transparent',
          }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5"
          >
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </template>
    </HeaderBar>

    <!-- 弹出菜单 - 移到根级别 -->
    <MenuPopover :visible="showMenu" @close="showMenu = false" @menu-click="handleMenuClick" />

    <!-- 内容区域 -->
    <div
      class="flex-1 flex flex-col items-center overflow-hidden relative"
      :style="{
        backgroundColor: 'var(--color-background)',
      }"
    >
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

      <!-- 主内容区域 -->
      <div class="flex-1 flex flex-col items-center justify-center w-full p-6">
        <!-- 卡片模式 -->
        <div v-if="wheelModeStore.isCardMode()" class="w-full flex-1 flex flex-col">
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
              ref="actionButtonsRef"
              :disabled="isAnimating || !canUseToday"
              :showMainButtons="true"
              @randomFood="handleRandomFood"
              @addFood="$emit('add-food')"
              @showFoodList="$emit('show-food-list')"
            />
          </div>
        </div>

        <!-- 转盘模式 -->
        <div v-if="wheelModeStore.isWheelMode()" class="w-full flex-1 flex flex-col">
          <!-- 转盘区域 -->
          <div class="flex-1 flex flex-col items-center justify-center">
            <LuckyWheel
              ref="luckyWheelRef"
              :foodList="combinedDishList"
              :currentTheme="themeStore.currentTheme"
              @result="handleWheelResult"
            />
          </div>
          <!-- 底部按钮区域 - 固定在底部 -->
          <div class="mt-auto pt-6 w-full">
            <ActionButtons
              ref="actionButtonsRef"
              :disabled="isAnimating || !canUseToday"
              :showMainButtons="true"
              @randomFood="handleRandomFood"
              @addFood="$emit('add-food')"
              @showFoodList="$emit('show-food-list')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 首次使用引导 -->
    <FirstUseGuide
      :showGuide="showFirstUseGuide"
      :targetElements="targetElements"
      @complete="handleFirstUseComplete"
      @skip="handleFirstUseSkip"
    />
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
  import LuckyWheel from './LuckyWheel.vue';
  import type { Food, RecommendationResult } from '@/types';
  import HeaderBar from '@/components/HeaderBar.vue';
  import { useFoodStore } from '@/stores';
  import { useChallengeStore } from '@/stores/challenge';
  import { useDevModeStore } from '@/stores/devMode';
  import { useWheelModeStore } from '@/stores/wheelMode';
  import { useThemeStore } from '@/stores/theme';
  import { useUserPreferenceStore } from '@/stores/userPreference';
  import { showFailToast } from 'vant';
  import FirstUseGuide from './FirstUseGuide.vue';

  const { t } = useI18n();
  const router = useRouter();

  const props = defineProps<{
    dishList: Food[];
    showResult: boolean;
  }>();

  const foodStore = useFoodStore();
  const challengeStore = useChallengeStore();
  const devModeStore = useDevModeStore();
  const wheelModeStore = useWheelModeStore();
  const themeStore = useThemeStore();
  const userPreferenceStore = useUserPreferenceStore();

  // 优先使用 store 中的数据，如果为空才使用 dishList
  const combinedDishList = computed(() => {
    if (foodStore.foodItems.length > 0) {
      // 直接返回 Food 类型
      return foodStore.foodItems;
    } else {
      // 如果 store 中没有数据，使用默认 dishList
      return props.dishList;
    }
  });

  const emit = defineEmits<{
    (e: 'random-food'): void;
    (e: 'add-food'): void;
    (e: 'show-food-list'): void;
    (e: 'selected-dish', dish: Food): void;
    (e: 'show-result'): void;
  }>();

  const isAnimating = ref(false);
  const showAchievements = ref(false);
  const showChallenge = ref(false);
  const showRecommendation = ref(false);
  const showMenu = ref(false);
  const dishCanvasRef = ref<InstanceType<typeof DishCanvas> | null>(null);
  const luckyWheelRef = ref<InstanceType<typeof LuckyWheel> | null>(null);
  const canvasContainer = ref<HTMLDivElement | null>(null);
  const recommendedDish = ref<Food | null>(null);

  // 首次使用引导相关
  const showFirstUseGuide = ref(false);
  const actionButtonsRef = ref<InstanceType<typeof ActionButtons> | null>(null);
  const menuButtonRef = ref<HTMLButtonElement | null>(null);

  const canUseToday = computed(() => challengeStore.canUseToday);

  // 页面加载时确保数据已经加载
  onMounted(() => {
    challengeStore.loadChallengeData();
    wheelModeStore.loadModeSettings();
    userPreferenceStore.loadUserPreference();

    // 检查是否需要显示首次使用引导
    if (userPreferenceStore.isFirstTimeUser) {
      // 延迟显示引导，确保页面完全加载
      setTimeout(() => {
        showFirstUseGuide.value = true;
      }, 1000);
    }
  });

  // 处理随机选菜
  const handleRandomFood = async () => {
    // 如果是首次使用，先关闭引导
    if (showFirstUseGuide.value) {
      userPreferenceStore.markFirstUseGuideAsSeen();
      showFirstUseGuide.value = false;
    }

    if (!canUseToday.value) {
      // 开发模式下显示不同的提示
      if (devModeStore.isUnlimitedUsesEnabled) {
        showFailToast('开发模式下应该可以无限使用，请检查配置');
      } else {
        showFailToast(t('messages.todayLimitReached'));
      }
      return;
    }

    // 根据当前模式执行不同逻辑
    if (wheelModeStore.isWheelMode()) {
      // 转盘模式：启动转盘
      if (luckyWheelRef.value) {
        luckyWheelRef.value.spin();
      }
    } else {
      // 卡片模式：通知父组件开始随机选菜
      emit('random-food');
    }
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
  const onAnimationComplete = (finalDish: Food) => {
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
    // 直接使用推荐的Food对象
    const selectedFood = recommendation.food;

    // 检查当前模式
    if (wheelModeStore.isWheelMode()) {
      // 转盘模式：直接跳转到结果页，类似转盘结果处理
      // 记录挑战数据
      const success = challengeStore.useRandomFood(selectedFood.name);
      if (!success) {
        showFailToast(t('messages.todayLimitReached'));
        return;
      }

      // 发送选择事件
      emit('selected-dish', selectedFood);

      // 直接显示结果页面
      emit('show-result');
    } else {
      // 卡片模式：使用动画展示推荐结果
      // 设置为推荐菜品
      recommendedDish.value = selectedFood;

      if (dishCanvasRef.value && !isAnimating.value) {
        isAnimating.value = true;
        try {
          // 直接传递菜品参数，确保目标菜品正确设置
          await dishCanvasRef.value.showTargetDish(selectedFood);
          // 动画完成后会自动调用 onAnimationComplete
        } catch (error) {
          console.error('显示推荐菜品动画失败:', error);
          isAnimating.value = false;
        }
      }
    }

    // 隐藏推荐面板（统一在这里关闭）
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
        // 切换推荐面板显示状态
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
      case 'login':
        // 用户登录：跳转到登录页面
        router.push('/login');
        break;
      case 'profile':
        // 用户资料：跳转到设置页面（用户信息部分）
        router.push('/settings');
        break;
    }
  };

  // 处理转盘结果
  const handleWheelResult = (food: Food) => {
    // 记录挑战数据
    const success = challengeStore.useRandomFood(food.name);
    if (!success) {
      showFailToast(t('messages.todayLimitReached'));
      return;
    }

    // 发送选择事件
    emit('selected-dish', food);

    // 显示结果页面
    emit('show-result');
  };

  // 处理首次使用引导
  const handleFirstUseComplete = () => {
    userPreferenceStore.markFirstUseGuideAsSeen();
    showFirstUseGuide.value = false;
  };

  const handleFirstUseSkip = () => {
    userPreferenceStore.markFirstUseGuideAsSeen();
    showFirstUseGuide.value = false;
  };

  // 计算目标元素
  const targetElements = computed(() => ({
    addButton: actionButtonsRef.value?.addButtonRef,
    randomButton: actionButtonsRef.value?.randomButtonRef,
    listButton: actionButtonsRef.value?.listButtonRef,
    menuButton: menuButtonRef.value,
  }));

  // 将方法暴露给父组件
  defineExpose({
    startRandomAnimation,
  });
</script>
