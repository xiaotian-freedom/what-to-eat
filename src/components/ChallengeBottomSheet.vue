<template>
  <BottomSheet :visible="visible" @close="$emit('close')" maxHeight="70vh">
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">{{ $t('challenge.title') }}</h2>
      <button
        @click="$emit('close')"
        class="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span class="text-lg">✕</span>
      </button>
    </div>

    <!-- 每日挑战统计 -->
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
      <div class="flex justify-between items-center">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ usedToday }}</div>
          <div class="text-sm text-gray-600">{{ $t('challenge.usedToday') }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ maxDailyUses }}</div>
          <div class="text-sm text-gray-600">{{ $t('challenge.maxDaily') }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ progressPercentage }}%</div>
          <div class="text-sm text-gray-600">{{ $t('challenge.progress') }}</div>
        </div>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">{{ $t('challenge.dailyProgress') }}</span>
        <span class="text-sm text-gray-600">
          {{ devModeStore.isUnlimitedUsesEnabled ? '∞' : remainingUses }}/{{ maxDailyUses }}
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div
          class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- 挑战状态卡片 -->
    <div class="space-y-4">
      <!-- 幸运值卡片 -->
      <div class="bg-white border border-gray-200 rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-lg">🍀</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">{{ $t('challenge.luckyValue') }}</h3>
              <p class="text-sm text-gray-600">{{ $t('challenge.luckyDesc') }}</p>
            </div>
          </div>
          <div class="text-2xl font-bold text-green-600">
            {{ challengeStore.challengeData.luckyValue }}
          </div>
        </div>
      </div>

      <!-- 连续天数卡片 -->
      <div class="bg-white border border-gray-200 rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span class="text-lg">🔥</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">{{ $t('challenge.consecutiveDays') }}</h3>
              <p class="text-sm text-gray-600">{{ $t('challenge.consecutiveDesc') }}</p>
            </div>
          </div>
          <div class="text-2xl font-bold text-orange-600">
            {{ challengeStore.challengeData.consecutiveDays }}
          </div>
        </div>
      </div>

      <!-- 使用限制提示 -->
      <div
        v-if="!canUseToday && !devModeStore.isUnlimitedUsesEnabled"
        class="bg-red-50 border border-red-200 rounded-2xl p-4"
      >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span class="text-lg">⏰</span>
          </div>
          <div>
            <h3 class="font-semibold text-red-700">{{ $t('challenge.limitReached') }}</h3>
            <p class="text-sm text-red-600">{{ $t('challenge.todayLimitReached') }}</p>
          </div>
        </div>
      </div>

      <!-- 开发模式提示 -->
      <div
        v-if="devModeStore.isUnlimitedUsesEnabled"
        class="bg-orange-50 border border-orange-200 rounded-2xl p-4"
      >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span class="text-lg">🔧</span>
          </div>
          <div>
            <h3 class="font-semibold text-orange-700">{{ $t('challenge.devMode') }}</h3>
            <p class="text-sm text-orange-600">{{ $t('challenge.unlimitedUse') }}</p>
          </div>
        </div>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BottomSheet from './BottomSheet.vue';
  import { useChallengeStore } from '@/stores/challenge';
  import { useDevModeStore } from '@/stores/devMode';

  const {} = useI18n();

  interface Props {
    visible: boolean;
  }

  defineProps<Props>();

  const challengeStore = useChallengeStore();
  const devModeStore = useDevModeStore();

  defineEmits<{
    (e: 'close'): void;
  }>();

  // 计算挑战统计
  const canUseToday = computed(() => challengeStore.canUseToday);
  const remainingUses = computed(() => challengeStore.remainingUses);
  const progressPercentage = computed(() => challengeStore.progressPercentage);
  const usedToday = computed(() => challengeStore.challengeData.dailyUses);
  const maxDailyUses = computed(() => challengeStore.challengeData.maxDailyUses);
</script>
