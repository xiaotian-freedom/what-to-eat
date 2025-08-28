<template>
  <BottomSheet
    :visible="visible"
    @close="handleClose"
    maxHeight="80vh"
    :title="$t('settings.about')"
  >
    <div class="about-content">
      <!-- 应用介绍 -->
      <div class="text-center mb-6">
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 theme-transition"
          :style="{
            background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
            boxShadow: '0 8px 20px -3px var(--color-shadow)',
          }"
        >
          <span class="text-white text-2xl">🍽️</span>
        </div>
        <h2
          class="text-2xl font-bold mb-2 theme-transition"
          :style="{ color: 'var(--color-text)' }"
        >
          {{ $t('app.name') }}
        </h2>
        <p class="text-sm theme-transition" :style="{ color: 'var(--color-textSecondary)' }">
          {{ $t('app.description') }}
        </p>
      </div>

      <!-- 功能特点 -->
      <div class="mb-6">
        <h3
          class="text-lg font-semibold mb-3 theme-transition"
          :style="{ color: 'var(--color-text)' }"
        >
          ✨ 主要功能
        </h3>
        <div class="space-y-2">
          <div
            v-for="featureKey in APP_CONFIG.featureKeys"
            :key="featureKey"
            class="flex items-center space-x-3 p-3 rounded-lg theme-transition"
            :style="{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }"
          >
            <span class="text-lg">{{ getFeatureIcon(featureKey) }}</span>
            <span class="theme-transition" :style="{ color: 'var(--color-text)' }">
              {{ $t(featureKey) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 开发者信息 -->
      <div class="mb-6">
        <h3
          class="text-lg font-semibold mb-3 theme-transition"
          :style="{ color: 'var(--color-text)' }"
        >
          {{ $t('settings.aboutContent.developer') }}
        </h3>
        <div
          @click="handleDeveloperClick"
          class="p-4 rounded-lg theme-transition cursor-pointer select-none hover:opacity-80 transition-all duration-150"
          :style="{
            backgroundColor: isClicked ? 'var(--color-primary)' : 'var(--color-surface)',
            border: `1px solid ${isClicked ? 'var(--color-primary)' : 'var(--color-border)'}`,
            opacity: isClicked ? '0.9' : '1',
          }"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center theme-transition"
              :style="{
                backgroundColor: isClicked ? 'white' : 'var(--color-primary)',
                color: isClicked ? 'var(--color-primary)' : 'white',
              }"
            >
              👨‍💻
            </div>
            <div>
              <div
                class="font-medium theme-transition"
                :style="{ color: isClicked ? 'white' : 'var(--color-text)' }"
              >
                {{ APP_CONFIG.developer.name }}
              </div>
              <div
                class="text-sm theme-transition"
                :style="{
                  color: isClicked ? 'rgba(255,255,255,0.8)' : 'var(--color-textSecondary)',
                }"
              >
                全栈开发者
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系信息 -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold theme-transition" :style="{ color: 'var(--color-text)' }">
          {{ $t('settings.aboutContent.contact') }}
        </h3>
        <div class="space-y-3">
          <!-- 邮箱 -->
          <div
            class="p-3 rounded-lg theme-transition"
            :style="{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }"
          >
            <div class="flex items-center space-x-3 mb-2">
              <span class="text-xl">📧</span>
              <span class="font-medium theme-transition" :style="{ color: 'var(--color-text)' }">
                {{ $t('settings.aboutContent.email') }}
              </span>
            </div>
            <div class="pl-8">
              <a
                :href="`mailto:${APP_CONFIG.developer.email}`"
                class="text-sm break-all transition-colors duration-200 hover:underline theme-transition"
                :style="{ color: 'var(--color-primary)' }"
              >
                {{ APP_CONFIG.developer.email }}
              </a>
            </div>
          </div>

          <!-- GitHub -->
          <div
            class="p-3 rounded-lg theme-transition"
            :style="{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }"
          >
            <div class="flex items-center space-x-3 mb-2">
              <span class="text-xl">🐙</span>
              <span class="font-medium theme-transition" :style="{ color: 'var(--color-text)' }">
                {{ $t('settings.aboutContent.github') }}
              </span>
            </div>
            <div class="pl-8">
              <a
                :href="APP_CONFIG.developer.github"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm break-all transition-colors duration-200 hover:underline theme-transition"
                :style="{ color: 'var(--color-primary)' }"
              >
                {{ APP_CONFIG.developer.github }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 版本信息 -->
      <div
        class="mt-6 p-4 rounded-lg text-center theme-transition"
        :style="{
          backgroundColor: 'var(--color-border)',
          color: 'var(--color-textSecondary)',
        }"
      >
        <div class="text-sm">{{ $t('settings.version') }}: {{ APP_CONFIG.version }}</div>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { APP_CONFIG } from '@/config/app';
  import { useDevModeStore } from '@/stores/devMode';
  import BottomSheet from './BottomSheet.vue';
  import { showSuccessToast } from 'vant';

  interface Props {
    /** 是否显示 BottomSheet */
    visible: boolean;
    /** 自定义样式类名 */
    customClass?: string;
  }

  withDefaults(defineProps<Props>(), {
    customClass: '',
  });

  const emit = defineEmits<{
    /** 关闭事件 */
    (e: 'close'): void;
  }>();

  useI18n();

  const devModeStore = useDevModeStore();

  // 开发者信息点击计数
  const developerClickCount = ref<number>(0);

  // 点击效果状态
  const isClicked = ref<boolean>(false);

  // 连续点击定时器
  let clickTimer: number | null = null;

  // 处理关闭事件
  const handleClose = () => {
    emit('close');
  };

  // 处理开发者信息点击
  const handleDeveloperClick = () => {
    // 触发点击效果
    isClicked.value = true;
    setTimeout(() => {
      isClicked.value = false;
    }, 150); // 150ms后恢复

    // 清除之前的定时器
    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    // 增加点击计数
    developerClickCount.value++;

    // 设置新的定时器，500ms后重置计数
    clickTimer = setTimeout(() => {
      if (developerClickCount.value < 10) {
        developerClickCount.value = 0; // 重置计数器
      }
    }, 500);

    // 连续点击10次后显示开发模式开关
    if (developerClickCount.value >= 10) {
      // 清除定时器，因为已经达成目标
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }

      devModeStore.showDevModeSwitch();
      developerClickCount.value = 0; // 重置计数器

      showSuccessToast('开发模式开关已开启');
    }
  };

  // 获取功能图标
  const getFeatureIcon = (featureKey: string): string => {
    const iconMap: Record<string, string> = {
      'app.features.randomFood': '🎲',
      'app.features.foodManagement': '📝',
      'app.features.achievements': '🏆',
      'app.features.dailyChallenge': '🎯',
      'app.features.animations': '✨',
    };
    return iconMap[featureKey] || '🍽️';
  };
</script>

<style scoped>
  .about-content {
    padding: 1.5rem;
  }

  .about-content a:active {
    transform: translateY(0);
  }
</style>
