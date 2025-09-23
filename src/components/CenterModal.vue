<template>
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- 中心弹窗内容 -->
        <Transition name="scale">
          <div
            v-if="visible"
            ref="modalRef"
            class="w-full max-w-md mx-auto rounded-2xl overflow-hidden theme-transition"
            :class="[customClass, { 'keyboard-visible': isKeyboardVisible }]"
            :style="{
              maxHeight: maxHeight,
              background: backgroundStyle.background,
              backgroundColor: backgroundStyle.backgroundColor || 'var(--color-surface)',
              boxShadow:
                '0 20px 25px -5px var(--color-shadow), 0 10px 10px -5px var(--color-shadow)',
              border: '1px solid var(--color-border)',
            }"
            @click.stop
          >
            <!-- 标题栏 -->
            <div
              v-if="title || showCloseButton"
              class="flex items-center justify-between px-6 py-5 border-b border-opacity-10"
              :style="{ borderColor: 'var(--color-border)' }"
            >
              <!-- 占位符，用于平衡布局 -->
              <div class="w-8 h-8" v-if="showCloseButton && title"></div>

              <!-- 标题 -->
              <h2
                v-if="title"
                class="text-lg font-semibold text-center theme-transition"
                :style="{ color: titleColor || 'var(--color-text)' }"
              >
                {{ title }}
              </h2>

              <!-- 关闭按钮 -->
              <button
                v-if="showCloseButton"
                @click="emit('close')"
                class="close-button w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-0 theme-transition"
                :style="{
                  backgroundColor: 'transparent',
                  color: closeButtonColor || 'var(--color-text)',
                }"
                :class="{ 'ml-auto': !title }"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- 内容区域 -->
            <div
              class="px-6 py-6 overflow-y-auto"
              :style="{
                maxHeight: `calc(${maxHeight} - ${title || showCloseButton ? '120px' : '60px'})`,
                background: backgroundStyle.background,
                backgroundColor: backgroundStyle.backgroundColor,
              }"
            >
              <slot></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed, ref, watch, nextTick } from 'vue';
  import { useKeyboardAdaptation } from '@/composables/useKeyboardAdaptation';

  interface Props {
    visible: boolean;
    maxHeight?: string;
    closeOnBackdrop?: boolean;
    backgroundColor?: string;
    backgroundStyle?: string | Record<string, string>;
    customClass?: string;
    title?: string;
    showCloseButton?: boolean;
    titleColor?: string;
    closeButtonColor?: string;
    enableKeyboardAdaptation?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxHeight: '80vh',
    closeOnBackdrop: true,
    backgroundColor: 'var(--color-surface)',
    backgroundStyle: undefined,
    customClass: '',
    title: '',
    showCloseButton: true,
    titleColor: undefined,
    closeButtonColor: undefined,
    enableKeyboardAdaptation: true,
  });

  // 键盘适配
  const { isKeyboardVisible, adjustContainerHeight } = useKeyboardAdaptation();
  const modalRef = ref<HTMLElement | null>(null);

  // 计算背景样式
  const backgroundStyle = computed((): Record<string, string> => {
    if (props.backgroundStyle) {
      // 如果提供了 backgroundStyle，优先使用
      if (typeof props.backgroundStyle === 'string') {
        return { background: props.backgroundStyle };
      }
      return props.backgroundStyle as Record<string, string>;
    } else {
      // 否则使用 backgroundColor
      return { backgroundColor: props.backgroundColor };
    }
  });

  // 监听键盘状态变化，调整 Modal 高度
  watch(
    [() => props.visible, isKeyboardVisible],
    ([visible]) => {
      if (visible && props.enableKeyboardAdaptation && modalRef.value) {
        nextTick(() => {
          adjustContainerHeight(modalRef.value!, props.maxHeight);
        });
      }
    },
    { immediate: true }
  );

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'select', ...args: any[]): void;
  }>();

  const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
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

  /* 中心弹窗缩放动画 */
  .scale-enter-active,
  .scale-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .scale-enter-from,
  .scale-leave-to {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }

  .scale-enter-to,
  .scale-leave-from {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  .close-button:active {
    transform: scale(0.95);
  }

  /* 键盘适配样式 */
  .keyboard-visible {
    transition: all 0.3s ease;
  }

  /* 当键盘弹起时，确保内容区域可以滚动 */
  .keyboard-visible .overflow-y-auto {
    max-height: calc(100% - 60px);
  }

  /* 响应式优化 */
  @media (max-width: 640px) {
    .fixed.inset-0 {
      padding: 1rem;
    }
  }

  /* 确保在移动设备上的良好显示 */
  @media (max-height: 600px) {
    .fixed.inset-0 {
      align-items: flex-start;
      padding-top: 2rem;
    }
  }
</style>
