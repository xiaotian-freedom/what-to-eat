<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        :style="{
          backgroundColor: computedBackdropColor,
        }"
        @click="handleBackdropClick"
      >
        <!-- Loading 内容容器 -->
        <div
          class="loading-container flex flex-col items-center justify-center p-8 rounded-2xl theme-transition"
          :style="{
            backgroundColor: computedModalBackgroundColor,
            boxShadow: `0 20px 25px -5px ${computedShadowColor}, 0 10px 10px -5px ${computedShadowColor}`,
            border: `1px solid ${computedBorderColor}`,
          }"
          @click.stop
        >
          <!-- Loading 动画 -->
          <div class="loading-spinner mb-4" :style="{ color: computedSpinnerColor }">
            <svg
              v-if="type === 'spinner'"
              class="animate-spin"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-dasharray="60"
                stroke-dashoffset="60"
                class="loading-circle"
              />
            </svg>

            <!-- 脉冲动画 -->
            <div
              v-else-if="type === 'pulse'"
              class="loading-pulse"
              :style="{ backgroundColor: computedSpinnerColor }"
            ></div>

            <!-- 波浪动画 -->
            <div v-else-if="type === 'wave'" class="loading-wave">
              <div
                v-for="i in 3"
                :key="i"
                class="wave-bar"
                :style="{
                  backgroundColor: computedSpinnerColor,
                  animationDelay: `${(i - 1) * 0.1}s`,
                }"
              ></div>
            </div>

            <!-- 旋转点动画 -->
            <div v-else-if="type === 'dots'" class="loading-dots">
              <div
                v-for="i in 3"
                :key="i"
                class="dot"
                :style="{
                  backgroundColor: computedSpinnerColor,
                  animationDelay: `${(i - 1) * 0.2}s`,
                }"
              ></div>
            </div>
          </div>

          <!-- 提示文字 -->
          <div
            v-if="text"
            class="loading-text text-center theme-transition"
            :style="{ color: computedTextColor }"
          >
            {{ text }}
          </div>

          <!-- 进度条（可选） -->
          <div v-if="showProgress && progress !== undefined" class="loading-progress w-full mt-4">
            <div
              class="progress-bar rounded-full overflow-hidden"
              :style="{
                backgroundColor: computedProgressBackgroundColor,
                height: '4px',
              }"
            >
              <div
                class="progress-fill h-full transition-all duration-300 ease-out"
                :style="{
                  backgroundColor: computedProgressColor,
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                }"
              ></div>
            </div>
            <div
              v-if="showProgressText"
              class="progress-text text-xs mt-2 text-center theme-transition"
              :style="{ color: computedTextSecondaryColor }"
            >
              {{ progressText || `${Math.round(progress || 0)}%` }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useThemeStore } from '@/stores/theme';

  interface Props {
    visible: boolean;
    text?: string;
    type?: 'spinner' | 'pulse' | 'wave' | 'dots';
    progress?: number;
    showProgress?: boolean;
    showProgressText?: boolean;
    progressText?: string;
    closable?: boolean;
    backdropClosable?: boolean;
    // 自定义颜色
    spinnerColor?: string;
    textColor?: string;
    modalBackgroundColor?: string;
    backdropColor?: string;
    borderColor?: string;
    shadowColor?: string;
    progressColor?: string;
    progressBackgroundColor?: string;
    textSecondaryColor?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    text: '',
    type: 'spinner',
    progress: undefined,
    showProgress: false,
    showProgressText: true,
    progressText: '',
    closable: false,
    backdropClosable: false,
    // 默认使用主题色
    spinnerColor: undefined,
    textColor: undefined,
    modalBackgroundColor: undefined,
    backdropColor: undefined,
    borderColor: undefined,
    shadowColor: undefined,
    progressColor: undefined,
    progressBackgroundColor: undefined,
    textSecondaryColor: undefined,
  });

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  const themeStore = useThemeStore();

  // 计算主题色
  const computedSpinnerColor = computed(
    () => props.spinnerColor || themeStore.currentThemeData.colors.primary
  );

  const computedTextColor = computed(
    () => props.textColor || themeStore.currentThemeData.colors.text
  );

  const computedModalBackgroundColor = computed(
    () => props.modalBackgroundColor || themeStore.currentThemeData.colors.surface
  );

  const computedBackdropColor = computed(() => props.backdropColor || 'transparent');

  const computedBorderColor = computed(
    () => props.borderColor || themeStore.currentThemeData.colors.border
  );

  const computedShadowColor = computed(
    () => props.shadowColor || themeStore.currentThemeData.colors.shadow
  );

  const computedProgressColor = computed(
    () => props.progressColor || themeStore.currentThemeData.colors.primary
  );

  const computedProgressBackgroundColor = computed(
    () => props.progressBackgroundColor || themeStore.currentThemeData.colors.border
  );

  const computedTextSecondaryColor = computed(
    () => props.textSecondaryColor || themeStore.currentThemeData.colors.textSecondary
  );

  const handleBackdropClick = () => {
    if (props.backdropClosable) {
      emit('close');
    }
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

  /* Loading 容器 */
  .loading-container {
    min-width: 200px;
    max-width: 320px;
    backdrop-filter: blur(10px);
  }

  /* 旋转动画 */
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* 圆形进度条动画 */
  .loading-circle {
    animation: loading-circle 1.5s ease-in-out infinite;
  }

  @keyframes loading-circle {
    0% {
      stroke-dasharray: 60;
      stroke-dashoffset: 60;
    }
    50% {
      stroke-dasharray: 60;
      stroke-dashoffset: 15;
    }
    100% {
      stroke-dasharray: 60;
      stroke-dashoffset: 60;
    }
  }

  /* 脉冲动画 */
  .loading-pulse {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
  }

  /* 波浪动画 */
  .loading-wave {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .wave-bar {
    width: 6px;
    height: 24px;
    border-radius: 3px;
    animation: wave 1.2s ease-in-out infinite;
  }

  @keyframes wave {
    0%,
    40%,
    100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
    }
  }

  /* 旋转点动画 */
  .loading-dots {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    animation: dots 1.4s ease-in-out infinite;
  }

  @keyframes dots {
    0%,
    80%,
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* 文字样式 */
  .loading-text {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    max-width: 280px;
    word-wrap: break-word;
  }

  /* 进度条样式 */
  .loading-progress {
    min-width: 200px;
  }

  .progress-bar {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .progress-fill {
    transition: width 0.3s ease-out;
  }

  .progress-text {
    font-size: 12px;
    opacity: 0.8;
  }

  /* 响应式设计 */
  @media (max-width: 640px) {
    .loading-container {
      margin: 0 20px;
      min-width: 160px;
      max-width: 280px;
    }

    .loading-text {
      font-size: 14px;
    }

    .loading-progress {
      min-width: 160px;
    }
  }
</style>
