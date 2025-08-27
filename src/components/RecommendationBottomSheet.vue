<template>
  <BottomSheet
    :visible="visible"
    @close="handleClose"
    maxHeight="85vh"
    backgroundStyle="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    indicatorColor="rgba(255, 255, 255, 0.6)"
  >
    <div class="recommendation-bottom-sheet">
      <!-- 推荐配置区域 -->
      <div class="config-section">
        <h3 class="section-title">🎯 个性化推荐</h3>

        <!-- 位置加载状态 -->
        <div class="location-status" v-if="isLoadingLocation">
          <div class="status-item loading">
            <span class="status-icon">📍</span>
            <span class="status-text">正在获取您的位置...</span>
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
        <div class="current-status" v-if="weatherData && !isLoadingLocation">
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
          <div class="status-item">
            <span class="status-icon">🕐</span>
            <span class="status-text">{{ currentTimeText }}</span>
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
          <label class="input-label">现在的心情：</label>
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
          <label class="input-label">身体状态：</label>
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

        <!-- 活动水平选择 -->
        <div class="activity-level-selector">
          <label class="input-label">今日活动水平：</label>
          <div class="activity-level-options">
            <button
              v-for="level in activityLevelOptions"
              :key="level.value"
              :class="['level-btn', { active: currentActivityLevel === level.value }]"
              @click="selectActivityLevel(level.value)"
            >
              <span class="level-emoji">{{ level.emoji }}</span>
              <span class="level-text">{{ level.label }}</span>
            </button>
          </div>
        </div>

        <!-- 特殊需求选择 -->
        <div class="dietary-restrictions-selector" v-if="showDietaryRestrictions">
          <label class="input-label">特殊饮食需求：</label>
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
          :disabled="isLoading || isExtraRecommendationLoading"
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
          }"
          :disabled="isLoading || isExtraRecommendationLoading"
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
        <span class="hint-text">系统已根据您的{{ choiceCount }}次选择优化推荐</span>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import BottomSheet from './BottomSheet.vue';
  import { useRecommendationStore } from '@/stores/recommendation';
  import { useUserPreferenceStore } from '@/stores/userPreference';
  import { useFoodStore } from '@/stores/food';
  import { useChallengeStore } from '@/stores/challenge';
  import { useDevModeStore } from '@/stores/devMode';
  import { getCurrentWeather } from '@/utils/weatherService';
  import { hybridRecommendationService } from '@/utils/hybridRecommendationService';
  import { deepseekService } from '@/utils/deepseekService';
  import { showFailToast } from 'vant';
  import type {
    RecommendationResult,
    WeatherData,
    MoodType,
    PhysicalState,
    ActivityLevel,
    DietaryRestriction,
    NetworkStatus,
  } from '@/types';
  import {
    MoodType as MoodEnum,
    PhysicalState as PhysicalStateEnum,
    ActivityLevel as ActivityLevelEnum,
    DietaryRestriction as DietaryRestrictionEnum,
    TimeOfDay,
    NetworkStatus as NetStatus,
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
    currentActivityLevel.value = null;
    currentDietaryRestrictions.value = [];

    // 重置推荐结果
    recommendations.value = [];

    // 重置UI状态
    showSuccessEffect.value = false;
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
      activityLevel: undefined,
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

  // 响应式数据
  const isLoading = ref(false);
  const isLoadingLocation = ref(false);
  const weatherData = ref<WeatherData | null>(null);
  const locationError = ref<string | null>(null);
  const currentMood = ref<MoodType | null>(null);
  const currentPhysicalState = ref<PhysicalState | null>(null);
  const currentActivityLevel = ref<ActivityLevel | null>(null);
  const currentDietaryRestrictions = ref<DietaryRestriction[]>([]);
  const showDietaryRestrictions = ref(true); // 控制是否显示特殊需求选择器
  const recommendations = ref<RecommendationResult[]>([]);
  const showSuccessEffect = ref(false);
  const networkStatus = ref<NetworkStatus>(hybridRecommendationService.getNetworkStatus());
  const usingAI = ref(false);
  const isExtraRecommendationLoading = ref(false); // 额外推荐加载状态

  // DOM 引用
  const rippleContainer = ref<HTMLDivElement | null>(null);
  const extraRippleContainer = ref<HTMLDivElement | null>(null);
  const sparklesContainer = ref<HTMLDivElement | null>(null);
  const extraSparklesContainer = ref<HTMLDivElement | null>(null);

  // 心情选项
  const moodOptions = [
    { value: MoodEnum.HAPPY, emoji: '😊', label: '开心' },
    { value: MoodEnum.RELAXED, emoji: '😌', label: '放松' },
    { value: MoodEnum.ENERGETIC, emoji: '⚡', label: '精力充沛' },
    { value: MoodEnum.TIRED, emoji: '😴', label: '疲惫' },
    { value: MoodEnum.STRESSED, emoji: '😰', label: '压力大' },
    { value: MoodEnum.SAD, emoji: '😢', label: '难过' },
    { value: MoodEnum.COMFORT, emoji: '🤗', label: '需要安慰' },
    { value: MoodEnum.ADVENTUROUS, emoji: '🚀', label: '想尝试新事物' },
  ];

  // 身体状态选项
  const physicalStateOptions = [
    { value: PhysicalStateEnum.NORMAL, emoji: '🆗', label: '正常' },
    { value: PhysicalStateEnum.SICK, emoji: '🤒', label: '感冒生病' },
    { value: PhysicalStateEnum.RECOVERING, emoji: '🌱', label: '病后恢复' },
    { value: PhysicalStateEnum.EXERCISED, emoji: '💪', label: '刚运动完' },
    { value: PhysicalStateEnum.HANGOVER, emoji: '🥴', label: '宿醉' },
    { value: PhysicalStateEnum.INSOMNIA, emoji: '🌙', label: '失眠' },
    { value: PhysicalStateEnum.PREGNANT, emoji: '🤱', label: '孕期' },
    { value: PhysicalStateEnum.MENSTRUAL, emoji: '🩸', label: '生理期' },
    { value: PhysicalStateEnum.PMS, emoji: '🌪️', label: '经前综合征' },
  ];

  // 活动水平选项
  const activityLevelOptions = [
    { value: ActivityLevelEnum.SEDENTARY, emoji: '🪑', label: '久坐' },
    { value: ActivityLevelEnum.LIGHT, emoji: '🚶', label: '轻度活动' },
    { value: ActivityLevelEnum.MODERATE, emoji: '🏃', label: '中度活动' },
    { value: ActivityLevelEnum.INTENSIVE, emoji: '🏋️', label: '高强度' },
  ];

  // 特殊饮食需求选项（只显示常用的）
  const dietaryRestrictionOptions = [
    { value: DietaryRestrictionEnum.VEGETARIAN, emoji: '🥬', label: '素食' },
    { value: DietaryRestrictionEnum.VEGAN, emoji: '🌱', label: '纯素' },
    { value: DietaryRestrictionEnum.GLUTEN_FREE, emoji: '🚫', label: '无麸质' },
    { value: DietaryRestrictionEnum.DIABETIC, emoji: '🩺', label: '糖尿病友好' },
    { value: DietaryRestrictionEnum.LOW_SODIUM, emoji: '🧂', label: '低钠' },
    { value: DietaryRestrictionEnum.KETO, emoji: '🥓', label: '生酮' },
  ];

  // 计算属性
  const currentTimeText = computed(() => {
    const timeOfDay = recommendationStore.getCurrentTimeOfDay();
    const timeMap = {
      [TimeOfDay.BREAKFAST]: '早餐时间',
      [TimeOfDay.LUNCH]: '午餐时间',
      [TimeOfDay.DINNER]: '晚餐时间',
      [TimeOfDay.SNACK]: '零食时间',
      [TimeOfDay.ANYTIME]: '任何时候',
    };
    return timeMap[timeOfDay] || '用餐时间';
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

  const recommendationButtonText = computed(() => {
    if (isLoading.value) {
      return usingAI.value ? '🤖 AI 分析中...' : '🔮 智能分析中...';
    }
    return canUseAI.value ? '🤖 AI 智能推荐' : '🔮 智能推荐';
  });

  const extraRecommendationButtonText = computed(() => {
    if (isExtraRecommendationLoading.value) {
      return '🎲 AI 扩展分析中...';
    }
    return '🎲 推荐新菜品';
  });

  const networkStatusText = computed(() => {
    switch (networkStatus.value) {
      case NetStatus.ONLINE:
        return canUseAI.value ? 'AI 推荐可用' : '仅本地推荐';
      case NetStatus.OFFLINE:
        return '离线模式';
      case NetStatus.CHECKING:
        return '检查网络...';
      default:
        return '未知状态';
    }
  });

  // 方法

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
        locationError.value = '无法获取位置信息，推荐将基于其他因素';
        // 不更新推荐系统的天气数据，让其使用其他因素进行推荐
      }
    } catch (error) {
      console.error('加载天气数据失败:', error);
      weatherData.value = null;
      locationError.value = '获取天气信息失败，推荐将基于其他因素';
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

  const selectActivityLevel = (level: ActivityLevel) => {
    currentActivityLevel.value = level;
    recommendationStore.updateContext({ activityLevel: level });
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
        showFailToast('开发模式下应该可以无限使用，请检查配置');
      } else {
        showFailToast('今日使用次数已用完，请明天再试');
      }
      return;
    }

    // if (foodStore.foodItems.length === 0) {
    //   showFailToast('请先添加一些菜品');
    //   return;
    // }

    // 创建点击波纹效果
    if (event) {
      createRippleEffect(event);
    }

    isLoading.value = true;
    usingAI.value = canUseAI.value;

    // 延迟启动粒子效果，让用户看到光效动画
    createSparkleEffect();

    try {
      // 确保有天气数据
      if (!weatherData.value) {
        await loadWeatherData();
      }

      // 构建推荐上下文
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
        activityLevel: currentActivityLevel.value || undefined,

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
      }

      emit('recommendationsUpdated', recommendations.value);

      if (recommendations.value.length === 0) {
        showFailToast('暂无合适的推荐');
      } else {
        // 显示成功效果
        showSuccessEffect.value = true;

        // 等待一小段时间让用户看到成功动画
        await new Promise(resolve => setTimeout(resolve, 800));

        // 直接使用选中的推荐结果
        const topRecommendation = recommendations.value[0];

        // 先触发选择事件
        emit('foodSelected', topRecommendation);

        // 延迟关闭弹窗，给动画一些时间开始
        setTimeout(() => {
          handleClose();
        }, 100);
      }
    } catch (error) {
      console.error('获取推荐失败:', error);

      // 根据错误类型显示不同的提示
      if (error instanceof Error) {
        if (error.message.includes('网络') || error.message.includes('超时')) {
          showFailToast('网络连接问题，已切换到本地推荐');
        } else if (error.message.includes('API')) {
          showFailToast('AI 服务暂不可用，使用本地推荐');
        } else {
          showFailToast('推荐失败，请重试');
        }
      } else {
        showFailToast('推荐失败，请重试');
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
        showFailToast('开发模式下应该可以无限使用，请检查配置');
      } else {
        showFailToast('今日使用次数已用完，请明天再试');
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
      // 确保有天气数据
      if (!weatherData.value) {
        await loadWeatherData();
      }

      // 构建推荐上下文
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
        activityLevel: currentActivityLevel.value || undefined,

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
      }

      emit('recommendationsUpdated', recommendations.value);

      if (recommendations.value.length === 0) {
        showFailToast('暂无合适的推荐');
      } else {
        // 显示成功效果
        showSuccessEffect.value = true;

        // 等待一小段时间让用户看到成功动画
        await new Promise(resolve => setTimeout(resolve, 800));

        // 直接使用选中的推荐结果
        const topRecommendation = recommendations.value[0];

        // 先触发选择事件
        emit('foodSelected', topRecommendation);

        // 延迟关闭弹窗，给动画一些时间开始
        setTimeout(() => {
          handleClose();
        }, 100);
      }
    } catch (error) {
      console.error('获取额外推荐失败:', error);

      // 根据错误类型显示不同的提示
      if (error instanceof Error) {
        if (error.message.includes('网络') || error.message.includes('超时')) {
          showFailToast('网络连接问题，无法获取额外推荐');
        } else if (error.message.includes('API')) {
          showFailToast('AI 服务暂不可用，无法获取额外推荐');
        } else {
          showFailToast('额外推荐失败，请重试');
        }
      } else {
        showFailToast('额外推荐失败，请重试');
      }
    } finally {
      isExtraRecommendationLoading.value = false;
      usingAI.value = false;

      // 清理粒子效果
      clearSparkleEffect(extraSparklesContainer.value);

      // 重置成功状态
      setTimeout(() => {
        showSuccessEffect.value = false;
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
    // 加载用户偏好数据
    userPreferenceStore.loadUserPreference();

    // 加载菜品数据
    foodStore.loadFoodItems();

    // 加载挑战数据
    challengeStore.loadChallengeData();

    // 加载天气数据
    await loadWeatherData();

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

  .mood-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
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
  .activity-level-selector,
  .dietary-restrictions-selector {
    margin-bottom: 20px;
  }

  .physical-state-options,
  .activity-level-options {
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
  .level-btn,
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

  .state-btn:hover,
  .level-btn:hover,
  .restriction-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .state-btn.active,
  .level-btn.active,
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

  .recommend-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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

  .extra-recommend-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: linear-gradient(135deg, #ff5722, #ff9800);
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

  .extra-recommend-btn:hover::before {
    left: 100%;
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
