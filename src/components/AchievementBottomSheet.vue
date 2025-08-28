<template>
  <BottomSheet
    :visible="visible"
    :title="$t('achievements.system')"
    @close="$emit('close')"
    maxHeight="70vh"
  >
    <!-- 成就统计 -->
    <div
      class="rounded-2xl p-4 mb-6 theme-transition"
      :style="{
        backgroundColor: 'var(--color-surface)',
        boxShadow: '0 2px 4px 1px var(--color-shadow)',
      }"
    >
      <div class="flex justify-between items-center">
        <div class="text-center">
          <div class="text-2xl font-bold" :style="{ color: 'var(--color-primary)' }">
            {{ unlockedCount }}
          </div>
          <div class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
            {{ $t('achievements.unlocked') }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold" :style="{ color: 'var(--color-secondary)' }">
            {{ totalCount }}
          </div>
          <div class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
            {{ $t('achievements.total') }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold" :style="{ color: 'var(--color-accent)' }">
            {{ progressPercentage }}%
          </div>
          <div class="text-sm" :style="{ color: 'var(--color-textSecondary)' }">
            {{ $t('achievements.completion') }}
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="mt-4">
        <div class="w-full rounded-full h-2" :style="{ backgroundColor: 'var(--color-border)' }">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :style="{
              width: `${progressPercentage}%`,
              background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 成就列表 -->
    <div class="space-y-3">
      <div
        v-for="achievement in challengeStore.challengeData.achievements"
        :key="achievement.id"
        class="border rounded-2xl p-4 transition-all duration-200 theme-transition"
        :style="{
          backgroundColor: 'var(--color-surface)',
          borderColor: achievement.isUnlocked ? 'var(--color-accent)' : 'var(--color-border)',
        }"
      >
        <div class="flex items-start space-x-4">
          <!-- 成就图标 -->
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-2xl theme-transition"
              :style="{
                backgroundColor: achievement.isUnlocked
                  ? 'var(--color-accent)'
                  : 'var(--color-border)',
                border: achievement.isUnlocked
                  ? '2px solid var(--color-accent)'
                  : '2px solid var(--color-border)',
                color: achievement.isUnlocked
                  ? 'var(--color-accent)'
                  : 'var(--color-textSecondary)',
                boxShadow: achievement.isUnlocked
                  ? '0 2px 8px rgba(0, 0, 0, 0.15)'
                  : '0 1px 4px rgba(0, 0, 0, 0.1)',
              }"
            >
              {{ achievement.icon }}
            </div>
          </div>

          <!-- 成就信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1">
              <h3
                class="font-semibold truncate"
                :style="{
                  color: achievement.isUnlocked ? 'var(--color-accent)' : 'var(--color-text)',
                }"
              >
                {{ $t(achievement.name) }}
              </h3>
              <span
                v-if="achievement.isUnlocked"
                class="text-sm flex-shrink-0"
                :style="{ color: 'var(--color-accent)' }"
              >
                ✓
              </span>
            </div>

            <p class="text-sm mb-2" :style="{ color: 'var(--color-textSecondary)' }">
              {{ $t(achievement.description) }}
            </p>

            <!-- 进度条 - 只在未解锁时显示 -->
            <div v-if="!achievement.isUnlocked" class="space-y-1">
              <div
                class="flex justify-between text-xs"
                :style="{ color: 'var(--color-textSecondary)' }"
              >
                <span>{{ $t('achievements.progress') }}</span>
                <span>{{ achievement.progress }}/{{ achievement.maxProgress }}</span>
              </div>
              <div
                class="w-full rounded-full h-2"
                :style="{ backgroundColor: 'var(--color-border)' }"
              >
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :style="{
                    width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                    backgroundColor: 'var(--color-primary)',
                  }"
                ></div>
              </div>
            </div>

            <!-- 解锁时间 -->
            <div v-if="achievement.isUnlocked && achievement.unlockDate" class="mt-2">
              <p class="text-xs" :style="{ color: 'var(--color-accent)' }">
                {{ $t('achievements.unlockTime') }}: {{ formatDate(achievement.unlockDate) }}
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
  import { useI18n } from 'vue-i18n';
  import BottomSheet from './BottomSheet.vue';
  import { useChallengeStore } from '@/stores/challenge';

  const { locale } = useI18n();

  interface Props {
    visible: boolean;
  }

  defineProps<Props>();
  const challengeStore = useChallengeStore();

  defineEmits<{
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
    return date.toLocaleDateString(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
</script>
