<template>
  <div class="achievement-panel bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
    <div class="flex items-center space-x-2 mb-2">
      <span class="text-sm">🏆</span>
      <span class="font-semibold text-gray-800 text-sm">成就</span>
    </div>

    <div class="space-y-1.5 max-h-32 overflow-y-auto">
      <div
        v-for="achievement in challengeStore.challengeData.achievements"
        :key="achievement.id"
        class="flex items-center space-x-2 p-1.5 rounded-lg transition-all duration-200"
        :class="achievement.isUnlocked ? 'bg-green-50 border border-green-200' : 'bg-gray-50'"
      >
        <div class="text-lg">{{ achievement.icon }}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-1">
            <span
              class="font-medium text-xs truncate"
              :class="achievement.isUnlocked ? 'text-green-700' : 'text-gray-600'"
            >
              {{ achievement.name }}
            </span>
            <span v-if="achievement.isUnlocked" class="text-green-500 text-xs flex-shrink-0"
              >✓</span
            >
          </div>
          <div class="text-xs text-gray-500 truncate">{{ achievement.description }}</div>
          <div v-if="!achievement.isUnlocked" class="mt-1">
            <div class="flex items-center space-x-1">
              <div class="flex-1 bg-gray-200 rounded-full h-1">
                <div
                  class="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  :style="{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }"
                ></div>
              </div>
              <span class="text-xs text-gray-500 flex-shrink-0">
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
