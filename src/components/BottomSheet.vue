<template>
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 backdrop-blur-sm z-40"
        @click="handleBackdropClick"
      ></div>
    </Transition>

    <!-- BottomSheet内容 -->
    <Transition name="slide-up">
      <div
        v-if="visible"
        class="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl theme-transition"
        :class="[customClass]"
        :style="{
          maxHeight: maxHeight,
          background: backgroundStyle.background,
          backgroundColor: backgroundStyle.backgroundColor || 'var(--color-surface)',
          boxShadow: '0 -10px 25px -3px var(--color-shadow)',
          borderTop: '1px solid var(--color-border)',
        }"
      >
        <!-- 拖拽指示器 -->
        <!-- <div class="flex justify-center pt-3 pb-2">
          <div
            class="w-12 h-1 rounded-full"
            :style="{ backgroundColor: indicatorColor || 'var(--color-border)' }"
          ></div>
        </div> -->

        <!-- 标题栏 -->
        <div v-if="title || showCloseButton" class="flex items-center justify-between px-6 py-5">
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
          class="px-6 pb-6 overflow-y-auto"
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
  </Teleport>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    visible: boolean;
    maxHeight?: string;
    closeOnBackdrop?: boolean;
    backgroundColor?: string;
    backgroundStyle?: string | Record<string, string>;
    customClass?: string;
    indicatorColor?: string;
    title?: string;
    showCloseButton?: boolean;
    titleColor?: string;
    closeButtonColor?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxHeight: '80vh',
    closeOnBackdrop: true,
    backgroundColor: 'var(--color-surface)',
    backgroundStyle: undefined,
    customClass: '',
    indicatorColor: 'var(--color-border)',
    title: '',
    showCloseButton: true,
    titleColor: undefined,
    closeButtonColor: undefined,
  });

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

  /* BottomSheet滑入滑出动画 */
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }

  .slide-up-enter-to,
  .slide-up-leave-from {
    transform: translateY(0);
    opacity: 1;
  }

  .close-button:active {
    transform: scale(0.95);
  }
</style>
