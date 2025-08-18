<template>
  <BottomSheet :visible="visible" @close="$emit('close')" maxHeight="70vh">
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">成就系统</h2>
      <button
        @click="$emit('close')"
        class="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span class="text-lg">✕</span>
      </button>
    </div>

    <!-- 成就统计 -->
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
      <div class="flex justify-between items-center">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ unlockedCount }}</div>
          <div class="text-sm text-gray-600">已解锁</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ totalCount }}</div>
          <div class="text-sm text-gray-600">总成就</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ progressPercentage }}%</div>
          <div class="text-sm text-gray-600">完成度</div>
        </div>
      </div>
    </div>

    <!-- 成就列表 -->
    <div class="space-y-3">
      <div
        v-for="achievement in challengeStore.challengeData.achievements"
        :key="achievement.id"
        class="bg-white border border-gray-200 rounded-2xl p-4 transition-all duration-200"
        :class="achievement.isUnlocked ? 'border-green-200 bg-green-50' : 'hover:bg-gray-50'"
      >
        <div class="flex items-start space-x-4">
          <!-- 成就图标 -->
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              :class="achievement.isUnlocked ? 'bg-green-100' : 'bg-gray-100'"
            >
              {{ achievement.icon }}
            </div>
          </div>

          <!-- 成就信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1">
              <h3
                class="font-semibold text-gray-800 truncate"
                :class="achievement.isUnlocked ? 'text-green-700' : ''"
              >
                {{ achievement.name }}
              </h3>
              <span v-if="achievement.isUnlocked" class="text-green-500 text-sm flex-shrink-0">
                ✓
              </span>
            </div>

            <p class="text-sm text-gray-600 mb-2">{{ achievement.description }}</p>

            <!-- 进度条 -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-gray-500">
                <span>进度</span>
                <span>{{ achievement.progress }}/{{ achievement.maxProgress }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="achievement.isUnlocked ? 'bg-green-500' : 'bg-blue-500'"
                  :style="{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- 解锁时间 -->
            <div v-if="achievement.isUnlocked && achievement.unlockDate" class="mt-2">
              <p class="text-xs text-green-600">
                解锁时间: {{ formatDate(achievement.unlockDate) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import BottomSheet from './BottomSheet.vue';
  import { useChallengeStore } from '@/stores/challenge';

  interface Props {
    visible: boolean;
  }

  const props = defineProps<Props>();
  const challengeStore = useChallengeStore();

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  // 计算成就统计
  const unlockedCount = computed(
    () => challengeStore.challengeData.achievements.filter(a => a.isUnlocked).length
  );

  const totalCount = computed(() => challengeStore.challengeData.achievements.length);

  const progressPercentage = computed(() =>
    Math.round((unlockedCount.value / totalCount.value) * 100)
  );

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
</script>
