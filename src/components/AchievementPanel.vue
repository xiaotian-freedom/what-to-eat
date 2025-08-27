<template>
  <div
    class="achievement-panel backdrop-blur-sm rounded-2xl p-3 shadow-lg theme-transition"
    :style="{
      backgroundColor: 'var(--color-surface)',
      opacity: 0.9,
      boxShadow: '0 10px 15px -3px var(--color-shadow)',
    }"
  >
    <div class="flex items-center space-x-2 mb-2">
      <span class="text-sm">🏆</span>
      <span class="font-semibold text-sm" :style="{ color: 'var(--color-text)' }">
        {{ $t('achievements.title') }}
      </span>
    </div>

    <div class="space-y-1.5 max-h-32 overflow-y-auto">
      <div
        v-for="achievement in challengeStore.challengeData.achievements"
        :key="achievement.id"
        class="flex items-center space-x-2 p-1.5 rounded-lg transition-all duration-200 theme-transition"
        :style="{
          backgroundColor: achievement.isUnlocked ? 'var(--color-accent)' : 'var(--color-border)',
          opacity: achievement.isUnlocked ? 0.15 : 0.1,
          border: achievement.isUnlocked
            ? '1px solid var(--color-accent)'
            : '1px solid var(--color-border)',
        }"
      >
        <div
          class="text-lg"
          :style="{
            color: achievement.isUnlocked ? 'var(--color-accent)' : 'var(--color-textSecondary)',
          }"
        >
          {{ achievement.icon }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-1">
            <span
              class="font-medium text-xs truncate"
              :style="{
                color: achievement.isUnlocked
                  ? 'var(--color-accent)'
                  : 'var(--color-textSecondary)',
              }"
            >
              {{ $t(achievement.name) }}
            </span>
            <span
              v-if="achievement.isUnlocked"
              class="text-xs flex-shrink-0"
              :style="{ color: 'var(--color-accent)' }"
            >
              ✓
            </span>
          </div>
          <div class="text-xs truncate" :style="{ color: 'var(--color-textSecondary)' }">
            {{ $t(achievement.description) }}
          </div>
          <div v-if="!achievement.isUnlocked" class="mt-1">
            <div class="flex items-center space-x-1">
              <div
                class="flex-1 rounded-full h-1"
                :style="{ backgroundColor: 'var(--color-border)' }"
              >
                <div
                  class="h-1 rounded-full transition-all duration-300"
                  :style="{
                    width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                    backgroundColor: 'var(--color-primary)',
                  }"
                ></div>
              </div>
              <span class="text-xs flex-shrink-0" :style="{ color: 'var(--color-textSecondary)' }">
                {{ achievement.progress }}/{{ achievement.maxProgress }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useChallengeStore } from '@/stores/challenge';

  const challengeStore = useChallengeStore();
</script>
