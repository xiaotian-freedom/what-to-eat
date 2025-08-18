<template>
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 bg-black/50 z-40" @click="handleBackdropClick"></div>
    </Transition>

    <!-- BottomSheet内容 -->
    <Transition name="slide-up">
      <div
        v-if="visible"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
        :style="{ maxHeight: maxHeight }"
      >
        <!-- 拖拽指示器 -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <!-- 内容区域 -->
        <div class="px-6 pb-6 overflow-y-auto" :style="{ maxHeight: `calc(${maxHeight} - 60px)` }">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { Teleport } from 'vue';

  interface Props {
    visible: boolean;
    maxHeight?: string;
    closeOnBackdrop?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxHeight: '80vh',
    closeOnBackdrop: true,
  });

  const emit = defineEmits<{
    (e: 'close'): void;
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
</style>
