<template>
  <BottomSheet :visible="visible" @close="$emit('close')" maxHeight="70vh">
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold" :style="{ color: 'var(--color-text)' }">
        {{ $t('challenge.title') }}
      </h2>
      <button
        @click="$emit('close')"
        class="p-1"
        :style="{
          color: 'var(--color-textSecondary)',
        }"
      >
        <span class="text-lg">✕</span>
      </button>
    </div>

    <!-- 每日挑战统计 -->
    <div
      class="rounded-2xl p-4 mb-6 theme-transition relative overflow-hidden"
      :style="{
        backgroundColor: 'var(--color-surface)',
        boxShadow: '0 2px 4px 1px var(--color-shadow)',
      }"
    >
      <div class="flex justify-between items-center relative z-10">
        <div class="text-center">
          <div class="text-2xl font-bold" :style="{ color: 'var(--color-primary)' }">
            {{ usedToday }}
          </div>
          <div class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
            {{ $t('challenge.usedToday') }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold" :style="{ color: 'var(--color-secondary)' }">
            {{ maxDailyUses }}
          </div>
          <div class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
            {{ $t('challenge.maxDaily') }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold" :style="{ color: 'var(--color-accent)' }">
            {{ progressPercentage }}%
          </div>
          <div class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
            {{ $t('challenge.progress') }}
          </div>
        </div>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium" :style="{ color: 'var(--color-text)' }">
          {{ $t('challenge.dailyProgress') }}
        </span>
        <span class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
          {{ devModeStore.isUnlimitedUsesEnabled ? '∞' : remainingUses }}/{{ maxDailyUses }}
        </span>
      </div>
      <div class="w-full rounded-full h-3" :style="{ backgroundColor: 'var(--color-border)' }">
        <div
          class="h-3 rounded-full transition-all duration-300"
          :style="{
            width: `${progressPercentage}%`,
            background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
          }"
        ></div>
      </div>
    </div>

    <!-- 挑战状态卡片 -->
    <div class="space-y-4">
      <!-- 幸运值卡片 -->
      <div
        class="border rounded-2xl p-4 theme-transition"
        :style="{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :style="{
                backgroundColor: 'var(--color-accent)',
              }"
            >
              <span class="text-lg" style="filter: contrast(1.2) brightness(1.1)">🍀</span>
            </div>
            <div>
              <h3 class="font-semibold" :style="{ color: 'var(--color-text)' }">
                {{ $t('challenge.luckyValue') }}
              </h3>
              <p class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
                {{ $t('challenge.luckyDesc') }}
              </p>
            </div>
          </div>
          <div class="text-2xl font-bold" :style="{ color: 'var(--color-accent)' }">
            {{ challengeStore.challengeData.luckyValue }}
          </div>
        </div>
      </div>

      <!-- 连续天数卡片 -->
      <div
        class="border rounded-2xl p-4 theme-transition"
        :style="{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :style="{
                backgroundColor: 'var(--color-secondary)',
              }"
            >
              <span class="text-lg" style="filter: contrast(1.2) brightness(1.1)">🔥</span>
            </div>
            <div>
              <h3 class="font-semibold" :style="{ color: 'var(--color-text)' }">
                {{ $t('challenge.consecutiveDays') }}
              </h3>
              <p class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
                {{ $t('challenge.consecutiveDesc') }}
              </p>
            </div>
          </div>
          <div class="text-2xl font-bold" :style="{ color: 'var(--color-secondary)' }">
            {{ challengeStore.challengeData.consecutiveDays }}
          </div>
        </div>
      </div>

      <!-- 使用限制提示 -->
      <div
        v-if="!canUseToday && !devModeStore.isUnlimitedUsesEnabled"
        class="border rounded-2xl p-4 theme-transition"
        :style="{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-accent)',
        }"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :style="{
              backgroundColor: 'var(--color-accent)',
            }"
          >
            <span class="text-lg" style="filter: contrast(1.2) brightness(1.1)">⏰</span>
          </div>
          <div>
            <h3 class="font-semibold" :style="{ color: 'var(--color-accent)' }">
              {{ $t('challenge.limitReached') }}
            </h3>
            <p class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
              {{ $t('challenge.todayLimitReached') }}
            </p>
          </div>
        </div>
      </div>

      <!-- 开发模式提示 -->
      <div
        v-if="devModeStore.isUnlimitedUsesEnabled"
        class="border rounded-2xl p-4 theme-transition"
        :style="{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-secondary)',
        }"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :style="{
              backgroundColor: 'var(--color-secondary)',
            }"
          >
            <span class="text-lg" style="filter: contrast(1.2) brightness(1.1)">🔧</span>
          </div>
          <div>
            <h3 class="font-semibold" :style="{ color: 'var(--color-secondary)' }">
              {{ $t('challenge.devMode') }}
            </h3>
            <p class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
              {{ $t('challenge.unlimitedUse') }}
            </p>
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
