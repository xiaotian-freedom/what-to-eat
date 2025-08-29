<template>
  <div
    class="backdrop-filter backdrop-blur-lg p-4 relative flex justify-between items-center theme-transition header-bar"
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      opacity: 0.9,
    }"
  >
    <!-- 左侧区域 -->
    <div class="flex items-center z-10">
      <a
        v-if="showBackButton"
        href="#"
        @click.prevent="handleBack"
        class="mr-2 p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 back-btn"
        :style="{
          color: 'var(--color-primary)',
          backgroundColor: 'transparent',
        }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 h-5"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </a>
    </div>

    <!-- 居中的标题 -->
    <div
      v-if="centerTitle"
      class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
    >
      <div
        class="text-lg font-bold text-transparent bg-clip-text text-center"
        :style="{
          color: 'var(--color-primary)',
        }"
      >
        {{ title }}
      </div>
    </div>

    <!-- 非居中时的标题 -->
    <div
      v-else
      class="text-lg font-bold text-transparent bg-clip-text"
      :style="{
        color: 'var(--color-primary)',
      }"
    >
      {{ title }}
    </div>

    <!-- 右侧按钮组 -->
    <div class="flex items-center space-x-2 z-10">
      <!-- 自定义右侧内容插槽 -->
      <slot name="rightContent">
        <!-- 默认右侧按钮组 -->
        <template v-if="rightButtons.length > 0 || rightIcon">
          <button
            v-for="(button, index) in rightButtons"
            :key="index"
            @click="button.onClick"
            :class="[
              'p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 right-btn',
              button.className || '',
            ]"
            :style="{
              color: 'var(--color-textSecondary)',
              backgroundColor: 'transparent',
            }"
          >
            <span class="text-lg">{{ button.icon }}</span>
          </button>
          <a
            v-if="rightIcon"
            href="#"
            @click.prevent="handleRightIconClick"
            class="p-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 right-icon-btn"
            :style="{
              color: 'var(--color-textSecondary)',
              backgroundColor: 'transparent',
            }"
          >
            <img :src="rightIcon" class="w-5 h-5" style="filter: opacity(1)" />
          </a>
        </template>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';

  const router = useRouter();

  interface RightButton {
    icon: string;
    onClick: () => void;
    className?: string;
  }

  const props = withDefaults(
    defineProps<{
      title: string;
      centerTitle?: boolean;
      showBackButton?: boolean;
      rightIcon?: string;
      rightButtons?: RightButton[];
      onBack?: () => void;
      onRightIconClick?: () => void;
    }>(),
    {
      centerTitle: false,
      showBackButton: true,
      rightIcon: '',
      rightButtons: () => [],
      onBack: undefined,
      onRightIconClick: undefined,
    }
  );

  const handleBack = () => {
    if (props.onBack) {
      props.onBack();
    } else {
      router.back();
    }
  };

  const handleRightIconClick = () => {
    if (props.onRightIconClick) {
      props.onRightIconClick();
    }
  };
</script>

<style scoped>
  /* 导航栏固定高度 */
  .header-bar {
    min-height: 50px; /* 固定最小高度 */
    height: 50px; /* 固定高度 */
  }

  /* 主题过渡动画 */
  .theme-transition {
    transition: all 0.3s ease;
  }

  /* 链接样式 */
  a {
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }

  /* 按钮样式 */
  button {
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }
</style>
