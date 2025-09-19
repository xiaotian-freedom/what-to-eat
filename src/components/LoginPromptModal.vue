<template>
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 backdrop-blur-sm z-50"
        @click="handleBackdropClick"
      ></div>
    </Transition>

    <!-- 弹窗内容 -->
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="modal-container w-full max-w-sm mx-auto rounded-3xl shadow-2xl theme-transition"
          :style="{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 25px 50px -12px var(--color-shadow)',
          }"
        >
          <!-- 内容区域 -->
          <div class="p-6 text-center">
            <!-- 图标 -->
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              :style="{
                backgroundColor: hexToRgba(themeStore.currentThemeData.colors.primary, 0.1),
              }"
            >
              <svg
                class="w-8 h-8"
                :style="{ color: themeStore.currentThemeData.colors.primary }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <!-- 标题 -->
            <h3
              class="text-lg font-semibold mb-2 theme-transition"
              :style="{ color: 'var(--color-text)' }"
            >
              {{ $t('loginPrompt.title') }}
            </h3>

            <!-- 描述 -->
            <p
              class="text-sm mb-6 theme-transition"
              :style="{ color: 'var(--color-textSecondary)' }"
            >
              {{ $t('loginPrompt.description') }}
            </p>

            <!-- 按钮组 -->
            <div class="flex space-x-3">
              <!-- 取消按钮 -->
              <button
                @click="handleCancel"
                class="flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-95 touch-manipulation"
                :style="{
                  backgroundColor: 'var(--color-border)',
                  color: 'var(--color-textSecondary)',
                }"
              >
                {{ $t('common.cancel') }}
              </button>

              <!-- 登录按钮 -->
              <button
                @click="handleLogin"
                class="flex-1 py-3 px-4 rounded-2xl font-semibold text-sm text-white transition-all duration-200 active:scale-95 touch-manipulation shadow-lg"
                :style="{
                  background:
                    'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                }"
              >
                {{ $t('loginPrompt.login') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { useThemeStore } from '@/stores/theme';

  interface Props {
    /** 是否显示弹窗 */
    visible: boolean;
    /** 是否可以通过点击遮罩层关闭 */
    closeOnBackdrop?: boolean;
    /** 自定义样式类名 */
    customClass?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    closeOnBackdrop: true,
    customClass: '',
  });

  const emit = defineEmits<{
    /** 关闭事件 */
    (e: 'close'): void;
    /** 取消事件 */
    (e: 'cancel'): void;
    /** 登录事件 */
    (e: 'login'): void;
  }>();

  const { t: $t } = useI18n();
  const router = useRouter();
  const themeStore = useThemeStore();

  // 处理遮罩层点击
  const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
      handleCancel();
    }
  };

  // 处理取消
  const handleCancel = () => {
    emit('cancel');
    emit('close');
  };

  // 处理登录
  const handleLogin = () => {
    emit('login');
    emit('close');
    // 跳转到登录页
    router.push('/login');
  };

  // 将十六进制颜色转换为rgba格式
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
</script>

<style scoped>
  /* 遮罩层淡入淡出动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* 弹窗动画 */
  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }

  .modal-enter-to,
  .modal-leave-from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  /* 按钮点击效果 */
  button:active {
    transform: scale(0.95);
  }

  /* 主题过渡 */
  .theme-transition {
    transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
  }
</style>
