<template>
  <BottomSheet
    :visible="visible"
    @close="handleClose"
    maxHeight="80vh"
    :title="$t('settings.theme')"
  >
    <div class="theme-selector-content">
      <!-- 主题网格 -->
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="theme in availableThemes"
          :key="theme.id"
          @click="selectTheme(theme.id as ThemeId)"
          class="theme-card relative cursor-pointer rounded-xl p-4 transition-all duration-200 hover:scale-105 active:scale-95"
          :class="[
            currentTheme === theme.id ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-lg',
          ]"
          :style="{
            background: `linear-gradient(135deg, ${getThemeGradient(theme.id as ThemeId)})`,
            border: `1px solid ${theme.colors.border}`
          }"
        >
          <!-- 主题图标 -->
          <div class="text-3xl mb-3">{{ theme.icon }}</div>

          <!-- 主题信息 -->
          <div class="space-y-1">
            <h3 class="font-semibold text-sm" :style="{ color: theme.colors.text }">
              {{ theme.name }}
            </h3>
            <p class="text-xs opacity-80" :style="{ color: theme.colors.textSecondary }">
              {{ theme.description }}
            </p>
          </div>

          <!-- 选中指示器 -->
          <div
            v-if="currentTheme === theme.id"
            class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <!-- 主题预览 -->
          <div class="mt-3 flex space-x-1">
            <div
              v-for="(color, key) in getThemePreviewColors(theme.id as ThemeId)"
              :key="key"
              class="w-4 h-4 rounded-full border border-white shadow-sm"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 主题说明 -->
      <div
        class="mt-6 p-4 rounded-lg theme-transition"
        :style="{
          backgroundColor: 'var(--color-border)',
          color: 'var(--color-textSecondary)',
        }"
      >
        <p class="text-sm">
          {{ $t('settings.themeDesc') }}
        </p>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useThemeStore } from '@/stores/theme';
  import type { ThemeId } from '@/types/theme';
  import BottomSheet from './BottomSheet.vue';

  interface Props {
    /** 是否显示 BottomSheet */
    visible: boolean;
    /** 自定义样式类名 */
    customClass?: string;
    /** 主题选择后是否自动关闭 */
    autoClose?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    customClass: '',
    autoClose: true,
  });

  const emit = defineEmits<{
    /** 关闭事件 */
    (e: 'close'): void;
    /** 主题选择事件 */
    (e: 'select', themeId: ThemeId): void;
    /** 主题更改事件 */
    (e: 'change', themeId: ThemeId): void;
  }>();

  useI18n();
  const themeStore = useThemeStore();

  // 计算属性
  const currentTheme = computed(() => themeStore.currentTheme);
  const availableThemes = computed(() => themeStore.availableThemes);

  // 选择主题
  const selectTheme = (themeId: ThemeId) => {
    if (themeId === currentTheme.value) {
      return;
    }

    // 设置主题
    themeStore.setTheme(themeId);

    // 触发事件
    emit('select', themeId);
    emit('change', themeId);

    // 自动关闭
    if (props.autoClose) {
      handleClose();
    }
  };

  // 处理关闭事件
  const handleClose = () => {
    emit('close');
  };

  // 获取主题渐变色
  const getThemeGradient = (themeId: ThemeId) => {
    const theme = themeStore.themes[themeId];
    if (!theme) return '';

    switch (themeId) {
      case 'default':
        return '#e0e7ff, #ddd6fe, #fce7f3';
      case 'dark':
        return '#0f172a, #581c87, #0f172a';
      case 'sunset':
        return '#fed7aa, #fce7f3, #fef3c7';
      case 'ocean':
        return '#cffafe, #dbeafe, #e0f2fe';
      case 'forest':
        return '#dcfce7, #d1fae5, #ccfbf1';
      case 'vintage':
        return '#f3e8ff, #ede9fe, #fdf4ff';
      default:
        return '#e0e7ff, #ddd6fe, #fce7f3';
    }
  };

  // 获取主题预览颜色
  const getThemePreviewColors = (themeId: ThemeId) => {
    const theme = themeStore.themes[themeId];
    if (!theme) return [];

    return [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.background,
    ];
  };
</script>

<style scoped>
  .theme-selector-content {
    padding: 1.5rem;
  }

  .theme-card {
    min-height: 120px;
    backdrop-filter: blur(10px);
  }

  .theme-card:active {
    transform: translateY(0) scale(0.95);
  }
</style>
