<template>
  <BottomSheet
    :visible="visible"
    @close="handleClose"
    maxHeight="80vh"
    backgroundStyle="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    :title="$t('recommendation.personalizedTitle')"
    titleColor="white"
    closeButtonColor="white"
  >
    <div class="recommendation-bottom-sheet">
      <!-- 推荐配置区域 -->
      <div class="config-section">
        <!-- 位置加载状态 -->
        <div class="location-status" v-if="isLoadingLocation">
          <div class="status-item loading">
            <span class="status-icon">📍</span>
            <span class="status-text">{{ $t('recommendation.gettingLocation') }}</span>
          </div>
        </div>

        <!-- 位置错误提示 -->
        <div class="location-error" v-if="locationError && !isLoadingLocation">
          <div class="error-item">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ locationError }}</span>
          </div>
        </div>

        <!-- 当前状态显示 -->
        <div class="current-status" v-if="!isLoadingLocation">
          <!-- 天气信息 -->
          <div class="weather-info" v-if="weatherData">
            <div class="status-item">
              <span class="status-icon">🌡️</span>
              <span class="status-text"
                >{{ weatherData.temperature }}°C {{ weatherData.condition }}</span
              >
            </div>
            <div class="status-item">
              <span class="status-icon">📍</span>
              <span class="status-text">{{ weatherData.location }}</span>
            </div>
          </div>

          <!-- 天气信息占位符 -->
          <div class="weather-info" v-else>
            <div class="status-item">
              <span class="status-icon">🌡️</span>
              <span class="status-text">{{ $t('recommendation.weatherUnavailable') }}</span>
            </div>
            <div class="status-item">
              <span class="status-icon">📍</span>
              <span class="status-text">{{ $t('recommendation.locationUnavailable') }}</span>
            </div>
          </div>

          <!-- 季节和时间信息 -->
          <div class="season-time-info">
            <div class="status-item">
              <span class="status-icon">🌱</span>
              <span class="status-text">{{ currentSeasonText }}</span>
            </div>
            <div class="status-item">
              <span class="status-icon">🕐</span>
              <span class="status-text">{{ currentTimeText }}</span>
            </div>
          </div>
        </div>

        <!-- 网络状态指示器 -->
        <div class="network-status" :class="{ offline: networkStatus === 'offline' }">
          <div class="status-item">
            <span class="status-icon">
              {{ networkStatus === 'offline' ? '📴' : canUseAI ? '🤖' : '🔌' }}
            </span>
            <span class="status-text">{{ networkStatusText }}</span>
          </div>
        </div>

        <!-- 心情选择 -->
        <div class="mood-selector">
          <label class="input-label">{{ $t('recommendation.currentMoodLabel') }}</label>
          <div class="mood-options">
            <button
              v-for="mood in moodOptions"
              :key="mood.value"
              :class="['mood-btn', { active: currentMood === mood.value }]"
              @click="selectMood(mood.value)"
            >
              <span class="mood-emoji">{{ mood.emoji }}</span>
              <span class="mood-text">{{ mood.label }}</span>
            </button>
          </div>
        </div>

        <!-- 身体状态选择 -->
        <div class="physical-state-selector">
          <label class="input-label">{{ $t('recommendation.physicalStateLabel') }}</label>
          <div class="physical-state-options">
            <button
              v-for="state in physicalStateOptions"
              :key="state.value"
              :class="['state-btn', { active: currentPhysicalState === state.value }]"
              @click="selectPhysicalState(state.value)"
            >
              <span class="state-emoji">{{ state.emoji }}</span>
              <span class="state-text">{{ state.label }}</span>
            </button>
          </div>
        </div>

        <!-- 餐后感受选择 -->
        <div class="post-meal-feeling-selector">
          <label class="input-label">{{ $t('recommendation.postMealFeelingLabel') }}</label>
          <div class="post-meal-feeling-options">
            <button
              v-for="feeling in postMealFeelingOptions"
              :key="feeling.value"
              :class="['feeling-btn', { active: currentPostMealFeeling === feeling.value }]"
              @click="selectPostMealFeeling(feeling.value)"
            >
              <span class="feeling-emoji">{{ feeling.emoji }}</span>
              <span class="feeling-text">{{ feeling.label }}</span>
            </button>
          </div>
        </div>

        <!-- 特殊需求选择 -->
        <div class="dietary-restrictions-selector" v-if="showDietaryRestrictions">
          <label class="input-label">{{ $t('recommendation.dietaryRestrictionsLabel') }}</label>
          <div class="dietary-restrictions-options">
            <button
              v-for="restriction in dietaryRestrictionOptions"
              :key="restriction.value"
              :class="[
                'restriction-btn',
                { active: currentDietaryRestrictions.includes(restriction.value) },
              ]"
              @click="toggleDietaryRestriction(restriction.value)"
            >
              <span class="restriction-emoji">{{ restriction.emoji }}</span>
              <span class="restriction-text">{{ restriction.label }}</span>
            </button>
          </div>
        </div>

        <!-- 推荐按钮 -->
        <button
          class="recommend-btn glow-button"
          :class="{
            'active loading': isLoading,
            success: showSuccessEffect,
          }"
          :disabled="isLoading || !canUseAIRecommendation"
          @click="getRecommendations($event)"
        >
          <!-- 波纹效果容器 -->
          <div class="ripple-container" ref="rippleContainer"></div>

          <!-- 粒子效果容器 -->
          <div class="sparkles-container" ref="sparklesContainer"></div>

          <!-- 按钮文字 -->
          <span class="button-text">
            {{ recommendationButtonText }}
          </span>
        </button>

        <!-- 额外推荐按钮 -->
        <button
          class="extra-recommend-btn"
          :class="{
            'active loading': isExtraRecommendationLoading,
            success: showExtraSuccessEffect,
          }"
          :disabled="isExtraRecommendationLoading || !canUseAIRecommendation"
          @click="getExtraRecommendation($event)"
        >
          <!-- 额外推荐按钮的波纹效果容器 -->
          <div class="ripple-container" ref="extraRippleContainer"></div>

          <!-- 额外推荐按钮的粒子效果容器 -->
          <div class="sparkles-container" ref="extraSparklesContainer"></div>

          <span class="button-text"> {{ extraRecommendationButtonText }} </span>
        </button>
      </div>

      <!-- 偏好学习提示 -->
      <div class="learning-hint" v-if="hasPreferenceData">
        <span class="hint-icon">🧠</span>
        <span class="hint-text">{{
          $t('recommendation.learningHint', { count: choiceCount })
        }}</span>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BottomSheet from './BottomSheet.vue';
  import { useRecommendationStore } from '@/stores/recommendation';
  import { useUserPreferenceStore } from '@/stores/userPreference';
  import { useFoodStore } from '@/stores/food';
  import { useChallengeStore } from '@/stores/challenge';
  import { useDevModeStore } from '@/stores/devMode';
  import { useUserStore } from '@/stores/user';
  import { getCurrentWeather } from '@/utils/weatherService';
  import { hybridRecommendationService } from '@/utils/hybridRecommendationService';
  import { deepseekService } from '@/utils/deepseekService';
  import { showFailToast } from 'vant';
  import type {
    RecommendationResult,
    WeatherData,
    MoodType,
    PhysicalState,
    PostMealFeeling,
    DietaryRestriction,
    NetworkStatus,
  } from '@/types';
  import {
    MoodType as MoodEnum,
    PhysicalState as PhysicalStateEnum,
    PostMealFeeling as PostMealFeelingEnum,
    DietaryRestriction as DietaryRestrictionEnum,
    TimeOfDay,
    NetworkStatus as NetStatus,
    Season,
  } from '@/types';
  import '@/assets/css/glow-animation.css';

  // Props
  interface Props {
    visible: boolean;
    maxRecommendations?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxRecommendations: 5,
  });

  // Emits
  const emit = defineEmits<{
    close: [];
    foodSelected: [recommendation: RecommendationResult];
    recommendationsUpdated: [recommendations: RecommendationResult[]];
  }>();

  // 重置数据的方法
  const resetData = () => {
    // 重置用户选择的状态
    currentMood.value = null;
    currentPhysicalState.value = null;
    currentPostMealFeeling.value = null;
    currentDietaryRestrictions.value = [];

    // 重置推荐结果
    recommendations.value = [];

    // 重置UI状态
    showSuccessEffect.value = false;
    showExtraSuccessEffect.value = false;
    isLoading.value = false;
    isExtraRecommendationLoading.value = false;
    usingAI.value = false;

    // 清理粒子效果
    clearSparkleEffect();
    clearSparkleEffect(extraSparklesContainer.value);

    // 重置推荐系统的上下文
    recommendationStore.updateContext({
      userMood: undefined,
      physicalState: undefined,
      postMealFeeling: undefined,
      dietaryRestrictions: undefined,
    });
  };

  // 处理关闭事件
  const handleClose = () => {
    // 重置数据
    resetData();
    // 触发关闭事件
    emit('close');
  };

  // Stores
  const recommendationStore = useRecommendationStore();
  const userPreferenceStore = useUserPreferenceStore();
  const foodStore = useFoodStore();
  const challengeStore = useChallengeStore();
  const devModeStore = useDevModeStore();
  const userStore = useUserStore();
  const { t } = useI18n();

  // 响应式数据
  const isLoading = ref(false);
  const isLoadingLocation = ref(false);
  const weatherData = ref<WeatherData | null>(null);
  const locationError = ref<string | null>(null);
  const currentMood = ref<MoodType | null>(null);
  const currentPhysicalState = ref<PhysicalState | null>(null);
  const currentPostMealFeeling = ref<PostMealFeeling | null>(null);
  const currentDietaryRestrictions = ref<DietaryRestriction[]>([]);
  const showDietaryRestrictions = ref(true); // 控制是否显示特殊需求选择器
  const recommendations = ref<RecommendationResult[]>([]);
  const showSuccessEffect = ref(false);
  const showExtraSuccessEffect = ref(false); // 额外推荐成功效果
  const networkStatus = ref<NetworkStatus>(hybridRecommendationService.getNetworkStatus());
  const usingAI = ref(false);
  const isExtraRecommendationLoading = ref(false); // 额外推荐加载状态

  // AI推荐使用次数管理（已登录用户从API获取，未登录用户使用本地存储）
  const trialUsage = ref({
    trialCount: 0, // 未登录用户试用次数
  });

  // DOM 引用
  const rippleContainer = ref<HTMLDivElement | null>(null);
  const extraRippleContainer = ref<HTMLDivElement | null>(null);
  const sparklesContainer = ref<HTMLDivElement | null>(null);
  const extraSparklesContainer = ref<HTMLDivElement | null>(null);

  // 心情选项
  const moodOptions = computed(() => [
    { value: MoodEnum.HAPPY, emoji: '😊', label: t('mood.happy') },
    { value: MoodEnum.RELAXED, emoji: '😌', label: t('mood.relaxed') },
    { value: MoodEnum.ENERGETIC, emoji: '⚡', label: t('mood.energetic') },
    { value: MoodEnum.TIRED, emoji: '😴', label: t('mood.tired') },
    { value: MoodEnum.STRESSED, emoji: '😰', label: t('mood.stressed') },
    { value: MoodEnum.SAD, emoji: '😢', label: t('mood.sad') },
    { value: MoodEnum.COMFORT, emoji: '🤗', label: t('mood.comfort') },
    { value: MoodEnum.ADVENTUROUS, emoji: '🚀', label: t('mood.adventurous') },
  ]);

  // 身体状态选项
  const physicalStateOptions = computed(() => [
    { value: PhysicalStateEnum.NORMAL, emoji: '🆗', label: t('physicalState.normal') },
    { value: PhysicalStateEnum.SICK, emoji: '🤒', label: t('physicalState.sick') },
    { value: PhysicalStateEnum.RECOVERING, emoji: '🌱', label: t('physicalState.recovering') },
    { value: PhysicalStateEnum.EXERCISED, emoji: '💪', label: t('physicalState.exercised') },
    { value: PhysicalStateEnum.HANGOVER, emoji: '🥴', label: t('physicalState.hangover') },
    { value: PhysicalStateEnum.INSOMNIA, emoji: '🌙', label: t('physicalState.insomnia') },
    { value: PhysicalStateEnum.PREGNANT, emoji: '🤱', label: t('physicalState.pregnant') },
    { value: PhysicalStateEnum.MENSTRUAL, emoji: '🩸', label: t('physicalState.menstrual') },
    { value: PhysicalStateEnum.PMS, emoji: '🌪️', label: t('physicalState.pms') },
  ]);

  // 餐后感受选项
  const postMealFeelingOptions = computed(() => [
    { value: PostMealFeelingEnum.SATISFYING, emoji: '🍽️', label: t('postMealFeeling.satisfying') },
    { value: PostMealFeelingEnum.REFRESHING, emoji: '🥗', label: t('postMealFeeling.refreshing') },
    { value: PostMealFeelingEnum.WARMING, emoji: '🍲', label: t('postMealFeeling.warming') },
    { value: PostMealFeelingEnum.COMFORTING, emoji: '🍰', label: t('postMealFeeling.comforting') },
  ]);

  // 特殊饮食需求选项（只显示常用的）
  const dietaryRestrictionOptions = computed(() => [
    {
      value: DietaryRestrictionEnum.VEGETARIAN,
      emoji: '🥬',
      label: t('dietaryRestriction.vegetarian'),
    },
    {
      value: DietaryRestrictionEnum.MEAT_LOVER,
      emoji: '🥩',
      label: t('dietaryRestriction.meatLover'),
    },
    {
      value: DietaryRestrictionEnum.LIGHT_OIL,
      emoji: '💧',
      label: t('dietaryRestriction.lightOil'),
    },
    {
      value: DietaryRestrictionEnum.DIABETIC,
      emoji: '🩺',
      label: t('dietaryRestriction.diabetic'),
    },
    {
      value: DietaryRestrictionEnum.MUSCLE_GAIN,
      emoji: '💪',
      label: t('dietaryRestriction.muscleGain'),
    },
    {
      value: DietaryRestrictionEnum.WEIGHT_LOSS,
      emoji: '🏃‍♀️',
      label: t('dietaryRestriction.weightLoss'),
    },
  ]);

  // 计算属性
  const currentTimeText = computed(() => {
    const timeOfDay = recommendationStore.getCurrentTimeOfDay();
    const timeMap = {
      [TimeOfDay.BREAKFAST]: t('timeOfDay.breakfast'),
      [TimeOfDay.LUNCH]: t('timeOfDay.lunch'),
      [TimeOfDay.DINNER]: t('timeOfDay.dinner'),
      [TimeOfDay.SNACK]: t('timeOfDay.snack'),
      [TimeOfDay.ANYTIME]: t('timeOfDay.anytime'),
    };
    return timeMap[timeOfDay] || t('timeOfDay.default');
  });

  const currentSeasonText = computed(() => {
    const season = recommendationStore.getCurrentSeason();
    const seasonMap = {
      [Season.SPRING]: t('season.spring'),
      [Season.SUMMER]: t('season.summer'),
      [Season.AUTUMN]: t('season.autumn'),
      [Season.WINTER]: t('season.winter'),
    };
    return seasonMap[season] || t('season.default');
  });

  const hasPreferenceData = computed(() => {
    return userPreferenceStore.hasPreferenceData;
  });

  const choiceCount = computed(() => {
    return userPreferenceStore.choiceHistory.length;
  });

  const canUseAI = computed(() => {
    return hybridRecommendationService.canUseAI();
  });

  // 检查今日是否可以使用智能推荐
  const canUseToday = computed(() => challengeStore.canUseToday);

  // 检查AI推荐使用权限
  const canUseAIRecommendation = computed(() => {
    // 开发模式下无限使用
    if (devModeStore.isUnlimitedUsesEnabled) {
      return true;
    }

    const isLoggedIn = userStore.isLoggedIn;

    if (isLoggedIn) {
      // 已登录用户：从API获取的使用次数信息
      return userStore.canUseAI;
    } else {
      // 未登录用户：总共1次试用机会
      return trialUsage.value.trialCount < 1;
    }
  });

  // 获取剩余使用次数
  const remainingAIUses = computed(() => {
    if (devModeStore.isUnlimitedUsesEnabled) {
      return Infinity;
    }

    const isLoggedIn = userStore.isLoggedIn;

    if (isLoggedIn) {
      // 已登录用户：从API获取的剩余使用次数
      return userStore.remainingAIUses;
    } else {
      // 未登录用户：总共1次试用机会
      return Math.max(0, 1 - trialUsage.value.trialCount);
    }
  });

  const recommendationButtonText = computed(() => {
    if (isLoading.value) {
      return usingAI.value ? t('recommendation.aiAnalyzing') : t('recommendation.smartAnalyzing');
    }

    // 检查是否可以使用AI推荐
    if (!canUseAIRecommendation.value) {
      const isLoggedIn = userStore.isLoggedIn;
      if (isLoggedIn) {
        return '今日AI推荐次数已用完';
      } else {
        return '试用次数已用完，请登录';
      }
    }

    // 显示剩余使用次数
    const remaining = remainingAIUses.value;
    if (remaining === Infinity) {
      return canUseAI.value
        ? t('recommendation.aiRecommendation')
        : t('recommendation.smartRecommendation');
    } else {
      const baseText = canUseAI.value
        ? t('recommendation.aiRecommendation')
        : t('recommendation.smartRecommendation');
      return `${baseText} (剩余${remaining}次)`;
    }
  });

  const extraRecommendationButtonText = computed(() => {
    if (isExtraRecommendationLoading.value) {
      return t('recommendation.extraAnalyzing');
    }

    // 检查是否可以使用AI推荐
    if (!canUseAIRecommendation.value) {
      const isLoggedIn = userStore.isLoggedIn;
      if (isLoggedIn) {
        return '今日AI推荐次数已用完';
      } else {
        return '试用次数已用完，请登录';
      }
    }

    // 显示剩余使用次数
    const remaining = remainingAIUses.value;
    if (remaining === Infinity) {
      return t('recommendation.extraRecommendation');
    } else {
      const baseText = t('recommendation.extraRecommendation');
      return `${baseText} (剩余${remaining}次)`;
    }
  });

  const networkStatusText = computed(() => {
    switch (networkStatus.value) {
      case NetStatus.ONLINE:
        return canUseAI.value ? t('recommendation.aiAvailable') : t('recommendation.localOnly');
      case NetStatus.OFFLINE:
        return t('recommendation.offlineMode');
      case NetStatus.CHECKING:
        return t('recommendation.checkingNetwork');
      default:
        return t('recommendation.unknownStatus');
    }
  });

  // 方法

  // 加载AI推荐使用次数数据
  const loadAIUsageData = async () => {
    try {
      const isLoggedIn = userStore.isLoggedIn;

      if (isLoggedIn) {
        // 已登录用户：从API获取使用次数信息
        await userStore.loadAIUsage();
      } else {
        // 未登录用户：从本地存储获取试用次数
        const stored = localStorage.getItem('aiRecommendationTrialUsage');
        if (stored) {
          const data = JSON.parse(stored);
          trialUsage.value = { ...trialUsage.value, ...data };
        }
      }
    } catch (error) {
      console.error('加载AI推荐使用次数数据失败:', error);
    }
  };

  // 保存AI推荐使用次数数据（仅用于未登录用户的试用次数）
  const saveTrialUsageData = () => {
    try {
      localStorage.setItem('aiRecommendationTrialUsage', JSON.stringify(trialUsage.value));
    } catch (error) {
      console.error('保存试用次数数据失败:', error);
    }
  };

  // 使用AI推荐
  const useAIRecommendation = async () => {
    const isLoggedIn = userStore.isLoggedIn;

    if (isLoggedIn) {
      // 已登录用户：通过API记录使用次数
      await userStore.useAIFeature();
    } else {
      // 未登录用户：增加试用次数
      trialUsage.value.trialCount++;
      saveTrialUsageData();
    }
  };

  const loadWeatherData = async () => {
    try {
      isLoadingLocation.value = true;
      locationError.value = null;

      // 使用便捷函数，会自动获取用户位置和天气数据
      const weather = await getCurrentWeather();

      if (weather) {
        // 成功获取天气数据
        weatherData.value = weather;
        recommendationStore.updateWeatherData(weather);
        locationError.value = null;
      } else {
        // 无法获取天气数据（位置权限被拒绝或API配置问题）
        weatherData.value = null;
        locationError.value = t('recommendation.locationError');
        // 不更新推荐系统的天气数据，让其使用其他因素进行推荐
      }
    } catch (error) {
      console.error('加载天气数据失败:', error);
      weatherData.value = null;
      locationError.value = t('recommendation.weatherFailed');
    } finally {
      isLoadingLocation.value = false;
    }
  };

  const selectMood = (mood: MoodType) => {
    currentMood.value = mood;
    recommendationStore.updateContext({ userMood: mood });
  };

  const selectPhysicalState = (state: PhysicalState) => {
    currentPhysicalState.value = state;
    recommendationStore.updateContext({ physicalState: state });
  };

  const selectPostMealFeeling = (feeling: PostMealFeeling) => {
    currentPostMealFeeling.value = feeling;
    recommendationStore.updateContext({ postMealFeeling: feeling });
  };

  const toggleDietaryRestriction = (restriction: DietaryRestriction) => {
    const index = currentDietaryRestrictions.value.indexOf(restriction);
    if (index > -1) {
      currentDietaryRestrictions.value.splice(index, 1);
    } else {
      currentDietaryRestrictions.value.push(restriction);
    }
    recommendationStore.updateContext({
      dietaryRestrictions:
        currentDietaryRestrictions.value.length > 0 ? currentDietaryRestrictions.value : undefined,
    });
  };

  // 创建波纹效果
  const createRippleEffect = (event: MouseEvent) => {
    const container = rippleContainer.value;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    container.appendChild(ripple);

    // 动画结束后移除元素
    setTimeout(() => {
      if (container.contains(ripple)) {
        container.removeChild(ripple);
      }
    }, 1500);
  };

  // 创建额外推荐按钮的波纹效果
  const createExtraRippleEffect = (event: MouseEvent) => {
    const container = extraRippleContainer.value;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    container.appendChild(ripple);

    // 动画结束后移除元素
    setTimeout(() => {
      if (container.contains(ripple)) {
        container.removeChild(ripple);
      }
    }, 1500);
  };

  // 清理粒子效果
  const clearSparkleEffect = (container?: HTMLDivElement | null) => {
    const targetContainer = container || sparklesContainer.value;
    if (!targetContainer) return;

    // 清除所有粒子
    while (targetContainer.firstChild) {
      targetContainer.removeChild(targetContainer.firstChild);
    }
  };

  // 创建粒子效果
  const createSparkleEffect = (container?: HTMLDivElement | null) => {
    const targetContainer = container || sparklesContainer.value;
    if (!targetContainer) return;

    // 先清理之前的粒子
    clearSparkleEffect(targetContainer);

    const sparkleCount = 8;

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';

      // 随机位置
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';

      // 随机延迟
      sparkle.style.animationDelay = Math.random() * 2 + 's';

      targetContainer.appendChild(sparkle);
    }
  };

  const getRecommendations = async (event?: MouseEvent) => {
    // 检查今日使用次数限制
    if (!canUseToday.value) {
      // 开发模式下显示不同的提示
      if (devModeStore.isUnlimitedUsesEnabled) {
        showFailToast(t('recommendation.devModeUnlimited'));
      } else {
        showFailToast(t('recommendation.dailyLimitReached'));
      }
      return;
    }

    // 检查AI推荐使用权限
    if (!canUseAIRecommendation.value) {
      const isLoggedIn = userStore.isLoggedIn;
      if (isLoggedIn) {
        showFailToast('今日AI推荐次数已用完，明天再来吧！');
      } else {
        showFailToast('试用次数已用完，登录后可获得更多推荐次数！');
      }
      return;
    }

    // 创建点击波纹效果
    if (event) {
      createRippleEffect(event);
    }

    isLoading.value = true;
    usingAI.value = canUseAI.value;

    createSparkleEffect();

    try {
      // 并行加载天气数据和构建推荐上下文
      await Promise.allSettled([
        // 如果没有天气数据，异步加载（不阻塞推荐）
        !weatherData.value ? loadWeatherData() : Promise.resolve(),
      ]);

      // 构建推荐上下文（使用当前天气数据，如果没有则使用默认值）
      const context = {
        // 环境因素
        currentWeather: weatherData.value?.weatherType,
        currentTime: recommendationStore.getCurrentTimeOfDay(),
        currentSeason: recommendationStore.getCurrentSeason(),
        location: weatherData.value?.location,
        temperature: weatherData.value?.temperature,
        humidity: weatherData.value?.humidity,

        // 用户状态
        userMood: currentMood.value || undefined,

        // 新增：身体状态相关
        physicalState: currentPhysicalState.value || undefined,
        postMealFeeling: currentPostMealFeeling.value || undefined,

        // 新增：特殊需求
        dietaryRestrictions:
          currentDietaryRestrictions.value.length > 0
            ? currentDietaryRestrictions.value
            : undefined,
      };

      // 使用混合推荐服务获取推荐
      const selectedRec = await hybridRecommendationService.getRecommendation(
        context,
        foodStore.foodItems
      );

      recommendations.value = [selectedRec];

      // 记录用户选择到偏好系统（用于学习）
      userPreferenceStore.recordChoice(selectedRec.food, context);

      // 记录智能推荐使用次数（开发模式下不增加使用次数）
      if (!devModeStore.isUnlimitedUsesEnabled) {
        challengeStore.useRandomFood(selectedRec.food.name);
        // 记录AI推荐使用次数
        await useAIRecommendation();
      }

      emit('recommendationsUpdated', recommendations.value);

      if (recommendations.value.length === 0) {
        showFailToast(t('recommendation.noSuitableRecommendation'));
      } else {
        // 显示成功效果
        showSuccessEffect.value = true;

        // 等待一小段时间让用户看到成功动画
        await new Promise(resolve => setTimeout(resolve, 800));

        // 直接使用选中的推荐结果
        const topRecommendation = recommendations.value[0];

        // 触发选择事件，交由父组件决定如何处理（卡片动画或直接跳转）
        emit('foodSelected', topRecommendation);
      }
    } catch (error) {
      console.error('获取推荐失败:', error);

      // 根据错误类型显示不同的提示
      if (error instanceof Error) {
        if (error.message.includes('网络') || error.message.includes('超时')) {
          showFailToast(t('recommendation.networkError'));
        } else if (error.message.includes('API')) {
          showFailToast(t('recommendation.aiUnavailable'));
        } else {
          showFailToast(t('recommendation.recommendationFailed'));
        }
      } else {
        showFailToast(t('recommendation.recommendationFailed'));
      }
    } finally {
      isLoading.value = false;
      usingAI.value = false;

      // 清理粒子效果
      clearSparkleEffect();

      // 重置成功状态
      setTimeout(() => {
        showSuccessEffect.value = false;
      }, 1000);
    }
  };

  // 获取额外推荐（强制AI推荐全新的菜品，不从本地列表选择）
  const getExtraRecommendation = async (event?: MouseEvent) => {
    // 检查今日使用次数限制
    if (!canUseToday.value) {
      if (devModeStore.isUnlimitedUsesEnabled) {
        showFailToast(t('recommendation.devModeUnlimited'));
      } else {
        showFailToast(t('recommendation.dailyLimitReached'));
      }
      return;
    }

    // 检查AI推荐使用权限
    if (!canUseAIRecommendation.value) {
      const isLoggedIn = userStore.isLoggedIn;
      if (isLoggedIn) {
        showFailToast('今日AI推荐次数已用完，明天再来吧！');
      } else {
        showFailToast('试用次数已用完，登录后可获得更多推荐次数！');
      }
      return;
    }

    // 创建额外推荐按钮的点击波纹效果
    if (event) {
      createExtraRippleEffect(event);
    }

    isExtraRecommendationLoading.value = true;
    usingAI.value = true; // 额外推荐强制使用AI

    // 延迟启动粒子效果
    createSparkleEffect(extraSparklesContainer.value);

    try {
      // 并行加载天气数据和构建推荐上下文
      await Promise.allSettled([
        // 如果没有天气数据，异步加载（不阻塞推荐）
        !weatherData.value ? loadWeatherData() : Promise.resolve(),
      ]);

      // 构建推荐上下文（使用当前天气数据，如果没有则使用默认值）
      const context = {
        // 环境因素
        currentWeather: weatherData.value?.weatherType,
        currentTime: recommendationStore.getCurrentTimeOfDay(),
        currentSeason: recommendationStore.getCurrentSeason(),
        location: weatherData.value?.location,
        temperature: weatherData.value?.temperature,
        humidity: weatherData.value?.humidity,

        // 用户状态
        userMood: currentMood.value || undefined,

        // 新增：身体状态相关
        physicalState: currentPhysicalState.value || undefined,
        postMealFeeling: currentPostMealFeeling.value || undefined,

        // 新增：特殊需求
        dietaryRestrictions:
          currentDietaryRestrictions.value.length > 0
            ? currentDietaryRestrictions.value
            : undefined,
      };

      // 强制AI进行扩展推荐，推荐全新的菜品（不从本地列表选择）
      const selectedRec = await deepseekService.getAIRecommendation(
        context,
        foodStore.foodItems,
        [], // 清空最近选择历史，强制AI推荐新菜品
        { forceExtendedRecommendation: true } // 强制扩展推荐，禁止从本地列表选择
      );

      recommendations.value = [selectedRec];

      // 记录用户选择到偏好系统（用于学习）
      userPreferenceStore.recordChoice(selectedRec.food, context);

      // 记录智能推荐使用次数（开发模式下不增加使用次数）
      if (!devModeStore.isUnlimitedUsesEnabled) {
        challengeStore.useRandomFood(selectedRec.food.name);
        // 记录AI推荐使用次数
        await useAIRecommendation();
      }

      emit('recommendationsUpdated', recommendations.value);

      if (recommendations.value.length === 0) {
        showFailToast(t('recommendation.noSuitableRecommendation'));
      } else {
        // 显示成功效果
        showExtraSuccessEffect.value = true;

        // 等待一小段时间让用户看到成功动画
        await new Promise(resolve => setTimeout(resolve, 800));

        // 直接使用选中的推荐结果
        const topRecommendation = recommendations.value[0];

        // 触发选择事件，交由父组件决定如何处理（卡片动画或直接跳转）
        // 确保额外推荐按钮的行为与智能推荐按钮完全一致
        emit('foodSelected', topRecommendation);
      }
    } catch (error) {
      console.error('获取额外推荐失败:', error);

      // 根据错误类型显示不同的提示
      if (error instanceof Error) {
        if (error.message.includes('网络') || error.message.includes('超时')) {
          showFailToast(t('recommendation.extraNetworkError'));
        } else if (error.message.includes('API')) {
          showFailToast(t('recommendation.extraAiUnavailable'));
        } else {
          showFailToast(t('recommendation.extraRecommendationFailed'));
        }
      } else {
        showFailToast(t('recommendation.extraRecommendationFailed'));
      }
    } finally {
      isExtraRecommendationLoading.value = false;
      usingAI.value = false;

      // 清理粒子效果
      clearSparkleEffect(extraSparklesContainer.value);

      // 重置成功状态
      setTimeout(() => {
        showExtraSuccessEffect.value = false;
      }, 1000);
    }
  };

  // 网络状态监听器清理函数
  let networkStatusInterval: number | null = null;

  // 监听面板可见性变化，当面板显示时重置数据
  watch(
    () => props.visible,
    (newVisible, oldVisible) => {
      if (newVisible && !oldVisible) {
        // 面板从隐藏变为显示时，重置数据
        resetData();
      }
    }
  );

  // 生命周期
  onMounted(async () => {
    // 并行加载所有数据，提升初始化速度
    await Promise.allSettled([
      // 加载用户偏好数据
      userPreferenceStore.loadUserPreference(),
      // 移除重复的 loadFoodItems 调用，由父组件统一管理
      // 加载挑战数据
      challengeStore.loadChallengeData(),
      // 加载AI推荐使用次数数据
      loadAIUsageData(),
      // 异步加载天气数据（不阻塞其他初始化）
      loadWeatherData().catch(err => console.warn('天气数据加载失败:', err)),
    ]);

    // 监听网络状态变化
    const updateNetworkStatus = () => {
      networkStatus.value = hybridRecommendationService.getNetworkStatus();
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // 定期更新网络状态
    networkStatusInterval = setInterval(updateNetworkStatus, 3000);
  });

  onUnmounted(() => {
    // 清理网络状态监听器
    if (networkStatusInterval) {
      clearInterval(networkStatusInterval);
    }

    // 移除事件监听器
    const updateNetworkStatus = () => {
      networkStatus.value = hybridRecommendationService.getNetworkStatus();
    };

    window.removeEventListener('online', updateNetworkStatus);
    window.removeEventListener('offline', updateNetworkStatus);
  });
</script>

<style scoped>
  .recommendation-bottom-sheet {
    padding: 20px;
    border-radius: 16px;
    color: white;
  }

  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 16px;
    text-align: center;
    color: white;
  }

  .location-status,
  .current-status,
  .network-status {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
  }

  .current-status {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .weather-info,
  .season-time-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .network-status.offline {
    background: rgba(255, 152, 0, 0.2);
    border: 1px solid rgba(255, 152, 0, 0.3);
  }

  .location-error {
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(255, 107, 107, 0.2);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 8px;
    color: white;
  }

  .error-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .error-icon {
    font-size: 16px;
  }

  .error-text {
    flex: 1;
  }

  .loading .status-text {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }

  .status-icon {
    font-size: 16px;
  }

  .mood-selector {
    margin-bottom: 20px;
  }

  .input-label {
    display: block;
    font-size: 14px;
    margin-bottom: 12px;
    font-weight: 500;
    color: white;
  }

  .mood-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }

  .mood-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .mood-btn.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    color: white;
    transform: scale(1.05);
  }

  .mood-emoji {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .mood-text {
    font-size: 10px;
    text-align: center;
  }

  /* 新增：身体状态选择器样式 */
  .physical-state-selector,
  .post-meal-feeling-selector,
  .dietary-restrictions-selector {
    margin-bottom: 20px;
  }

  .physical-state-options,
  .post-meal-feeling-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }

  .dietary-restrictions-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }

  .state-btn,
  .feeling-btn,
  .restriction-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .state-btn.active,
  .feeling-btn.active,
  .restriction-btn.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    color: white;
    transform: scale(1.05);
  }

  .state-emoji,
  .level-emoji,
  .restriction-emoji {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .state-text,
  .level-text,
  .restriction-text {
    font-size: 10px;
    text-align: center;
  }

  .recommend-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(45deg, #818cf8, #6366f1);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 20px 0;
    position: relative;
    overflow: hidden;
  }

  .recommend-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .recommend-btn .button-text {
    position: relative;
    z-index: 2;
    display: block;
  }

  /* 确保波纹和粒子效果在按钮内部 */
  .recommend-btn .ripple-container,
  .recommend-btn .sparkles-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
  }

  /* 额外推荐按钮样式 */
  .extra-recommend-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border-radius: 12px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 10px 0;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .extra-recommend-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .extra-recommend-btn .button-text {
    display: block;
    position: relative;
    z-index: 2;
  }

  /* 额外推荐按钮的波纹效果容器 */
  .extra-recommend-btn .ripple-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
  }

  /* 额外推荐按钮的特殊效果 */
  .extra-recommend-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  /* 额外推荐按钮加载状态 */
  .extra-recommend-btn.loading {
    background: linear-gradient(135deg, #e64a19, #f57c00);
    animation: pulse 1.5s ease-in-out infinite;
  }

  /* 额外推荐按钮的粒子效果容器 */
  .extra-recommend-btn .sparkles-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    border-radius: 12px;
    overflow: hidden;
    z-index: 1;
  }

  /* 额外推荐按钮的粒子样式 */
  .extra-recommend-btn .sparkle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    animation: sparkle 2s ease-in-out infinite;
    pointer-events: none;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
  }

  /* 额外推荐按钮的粒子动画 */
  @keyframes sparkle {
    0%,
    100% {
      opacity: 0;
      transform: scale(0);
    }

    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .recommendation-action {
    margin-top: 20px;
    text-align: center;
  }

  .learning-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 12px;
    color: white;
    opacity: 0.9;
  }

  .hint-icon {
    font-size: 14px;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .mood-options {
      grid-template-columns: repeat(4, 1fr);
    }

    .current-status {
      flex-direction: column;
      gap: 12px;
    }

    .weather-info,
    .season-time-info {
      flex-direction: row;
      justify-content: space-around;
    }

    .recommendation-item {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
      gap: 8px;
    }

    .food-info {
      margin-right: 0;
      justify-content: center;
    }

    .recommendation-reasons {
      margin-right: 0;
    }
  }
</style>
