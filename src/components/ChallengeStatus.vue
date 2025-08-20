<template>
  <div class="challenge-status bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg min-w-48">
    <!-- 每日挑战状态 -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-1">
        <span class="text-sm">🎯</span>
        <span class="font-semibold text-gray-800 text-sm">{{ $t('challenge.title') }}</span>
      </div>
      <div class="text-xs text-gray-600 font-medium">
        {{ remainingUses }}/{{ challengeStore.challengeData.maxDailyUses }}
      </div>
    </div>

    <!-- 进度条 -->
    <div class="w-full bg-gray-200 rounded-full h-1.5 mb-2">
      <div
        class="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>

    <!-- 幸运值和连续天数 -->
    <div class="flex justify-between text-xs">
      <div class="flex items-center space-x-1">
        <span>🍀</span>
        <span class="text-gray-700">{{ challengeStore.challengeData.luckyValue }}</span>
      </div>
      <div class="flex items-center space-x-1">
        <span>🔥</span>
        <span class="text-gray-700"
          >{{ challengeStore.challengeData.consecutiveDays }}{{ $t('challenge.times') }}</span
        >
      </div>
    </div>

    <!-- 使用限制提示 -->
    <div v-if="!canUseToday" class="mt-2 p-1.5 bg-orange-100 rounded-lg">
      <div class="flex items-center space-x-1 text-orange-700">
        <span class="text-xs">⏰</span>
        <span class="text-xs">{{ $t('challenge.todayLimitReached') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useChallengeStore } from '@/stores/challenge';

  const challengeStore = useChallengeStore();

  const canUseToday = computed(() => challengeStore.canUseToday);
  const remainingUses = computed(() => challengeStore.remainingUses);
  const progressPercentage = computed(() => challengeStore.progressPercentage);
</script>
