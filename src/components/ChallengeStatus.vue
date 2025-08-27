<template>
  <div
    class="challenge-status backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl relative overflow-hidden theme-transition"
    :style="{
      width: isExpanded ? '200px' : '48px',
      height: isExpanded ? (contentVisible ? 'auto' : getExpandedHeight()) : '48px',
      minHeight: isExpanded ? getExpandedHeight() : '48px',
      backgroundColor: 'var(--color-surface)',
      opacity: 0.9,
      boxShadow: '0 10px 15px -3px var(--color-shadow)',
    }"
    @click="toggleExpand"
  >
    <!-- 折叠状态 - 只显示图标和剩余次数 -->
    <div
      class="flex flex-col items-center justify-center transition-all duration-300 absolute inset-0"
      :class="[isExpanded ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100']"
    >
      <div class="text-lg">🎯</div>
      <div
        class="text-xs font-bold"
        :style="{
          color:
            remainingUses === 0
              ? '#dc2626'
              : devModeStore.isUnlimitedUsesEnabled
              ? '#ea580c'
              : 'var(--color-textSecondary)',
        }"
      >
        {{ devModeStore.isUnlimitedUsesEnabled ? '∞' : remainingUses }}
      </div>
    </div>

    <!-- 展开状态 - 显示完整信息 -->
    <div
      v-show="isExpanded"
      class="w-full h-full flex flex-col justify-center p-3"
      :class="[contentVisible ? 'opacity-100' : 'opacity-0']"
      style="transition: opacity 0.2s ease-in-out"
    >
      <!-- 每日挑战状态 -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-1">
          <span class="text-sm">🎯</span>
          <span class="font-semibold text-sm" :style="{ color: 'var(--color-text)' }">
            {{ $t('challenge.title') }}
          </span>
        </div>
        <div class="text-xs font-medium" :style="{ color: 'var(--color-textSecondary)' }">
          {{ devModeStore.isUnlimitedUsesEnabled ? '∞' : remainingUses }}/{{
            challengeStore.challengeData.maxDailyUses
          }}
        </div>
      </div>

      <!-- 进度条 -->
      <div
        class="w-full rounded-full h-1.5 mb-2"
        :style="{ backgroundColor: 'var(--color-border)' }"
      >
        <div
          class="h-1.5 rounded-full transition-all duration-300"
          :style="{
            width: `${progressPercentage}%`,
            background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
          }"
        ></div>
      </div>

      <!-- 幸运值和连续天数 -->
      <div class="flex justify-between text-xs">
        <div class="flex items-center space-x-1">
          <span>🍀</span>
          <span :style="{ color: 'var(--color-textSecondary)' }">
            {{ challengeStore.challengeData.luckyValue }}
          </span>
        </div>
        <div class="flex items-center space-x-1">
          <span>🔥</span>
          <span :style="{ color: 'var(--color-textSecondary)' }"
            >{{ challengeStore.challengeData.consecutiveDays }}{{ $t('challenge.times') }}</span
          >
        </div>
      </div>

      <!-- 使用限制提示 -->
      <div
        v-if="!canUseToday && !devModeStore.isUnlimitedUsesEnabled"
        class="mt-2 p-1.5 rounded-lg theme-transition"
        :style="{
          backgroundColor: 'var(--color-accent)',
          opacity: 0.15,
        }"
      >
        <div class="flex items-center space-x-1">
          <span class="text-xs">⏰</span>
          <span class="text-xs" :style="{ color: 'var(--color-accent)' }">
            {{ $t('challenge.todayLimitReached') }}
          </span>
        </div>
      </div>

      <!-- 开发模式提示 -->
      <div
        v-if="devModeStore.isUnlimitedUsesEnabled"
        class="mt-2 p-1.5 rounded-lg theme-transition"
        :style="{
          backgroundColor: 'var(--color-secondary)',
          opacity: 0.15,
        }"
      >
        <div class="flex items-center space-x-1">
          <span class="text-xs">🔧</span>
          <span class="text-xs" :style="{ color: 'var(--color-secondary)' }">
            开发模式：无限使用
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useChallengeStore } from '@/stores/challenge';
  import { useDevModeStore } from '@/stores/devMode';
  import { computed, onUnmounted, ref } from 'vue';

  const challengeStore = useChallengeStore();
  const devModeStore = useDevModeStore();

  // 控制展开/折叠状态
  const isExpanded = ref(false);
  // 控制内容显示状态
  const contentVisible = ref(false);
  let autoHideTimer: number | null = null;
  let contentTimer: number | null = null;

  const canUseToday = computed(() => challengeStore.canUseToday);
  const remainingUses = computed(() => challengeStore.remainingUses);
  const progressPercentage = computed(() => challengeStore.progressPercentage);

  // 计算展开时的高度
  const getExpandedHeight = () => {
    // 基础内容高度：标题(24px) + 进度条(6px) + 幸运值(16px) + 内边距(24px) = 70px
    const baseHeight = 70;
    // 如果有使用限制提示或开发模式提示，额外增加高度
    const warningHeight =
      (!canUseToday.value && !devModeStore.isUnlimitedUsesEnabled) ||
      devModeStore.isUnlimitedUsesEnabled
        ? 40
        : 0;
    return `${baseHeight + warningHeight}px`;
  };

  // 切换展开/折叠状态
  const toggleExpand = () => {
    if (isExpanded.value) {
      // 收起：先收起容器，再隐藏内容
      isExpanded.value = false;
      setTimeout(() => {
        contentVisible.value = false;
      }, 300); // 等待容器收起动画完成
    } else {
      // 展开：先展开容器，再显示内容
      isExpanded.value = true;
      setTimeout(() => {
        contentVisible.value = true;
      }, 300); // 等待容器展开动画完成
    }

    // 重置自动收起定时器
    if (isExpanded.value) {
      startAutoHideTimer();
    } else {
      clearAutoHideTimer();
    }
  };

  // 开始自动收起定时器
  const startAutoHideTimer = () => {
    clearAutoHideTimer();
    autoHideTimer = window.setTimeout(() => {
      toggleExpand();
    }, 5000); // 5秒后自动收起
  };

  // 清除自动收起定时器
  const clearAutoHideTimer = () => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
  };

  // 暴露展开状态给父组件
  defineExpose({
    isExpanded,
    toggleExpand,
  });

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearAutoHideTimer();
    if (contentTimer) {
      clearTimeout(contentTimer);
    }
  });
</script>
