<template>
  <!-- 弹出菜单 -->
  <transition
    name="curtain"
    enter-active-class="curtain-enter-active"
    enter-from-class="curtain-enter-from"
    enter-to-class="curtain-enter-to"
    leave-active-class="curtain-leave-active"
    leave-from-class="curtain-leave-from"
    leave-to-class="curtain-leave-to"
  >
    <div
      v-if="visible"
      ref="menuRef"
      class="fixed top-16 right-4 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[160px] overflow-hidden"
      style="transform-origin: top right"
    >
      <!-- 智能推荐 -->
      <button
        @click.stop="handleMenuClick('recommendation')"
        class="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 active:bg-blue-500/20 transition-all duration-150 ease-out focus:outline-none"
      >
        <span class="text-lg mr-3">🎯</span>
        <span class="text-sm font-medium text-gray-700">{{ $t('menu.smartRecommendation') }}</span>
      </button>

      <!-- 每日挑战 -->
      <button
        @click.stop="handleMenuClick('challenge')"
        class="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 active:bg-blue-500/20 transition-all duration-150 ease-out focus:outline-none"
      >
        <span class="text-lg mr-3">🔥</span>
        <span class="text-sm font-medium text-gray-700">{{ $t('menu.dailyChallenge') }}</span>
      </button>

      <!-- 成就系统 -->
      <button
        @click.stop="handleMenuClick('achievements')"
        class="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 active:bg-blue-500/20 transition-all duration-150 ease-out focus:outline-none"
      >
        <span class="text-lg mr-3">🏆</span>
        <span class="text-sm font-medium text-gray-700">{{ $t('menu.achievements') }}</span>
      </button>

      <!-- 分割线 -->
      <div class="h-px bg-gray-100 mx-2 my-1"></div>

      <!-- 系统设置 -->
      <button
        @click.stop="handleMenuClick('settings')"
        class="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 active:bg-blue-500/20 transition-all duration-150 ease-out focus:outline-none"
      >
        <span class="text-lg mr-3">⚙️</span>
        <span class="text-sm font-medium text-gray-700">{{ $t('menu.settings') }}</span>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';

  interface Props {
    visible: boolean;
  }

  interface Emits {
    (e: 'close'): void;
    (e: 'menu-click', action: string): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const menuRef = ref<HTMLElement>();

  const handleMenuClick = (action: string) => {
    emit('menu-click', action);
    emit('close');
  };

  // 处理点击外部区域关闭菜单
  const handleClickOutside = (event: MouseEvent) => {
    if (props.visible && menuRef.value && !menuRef.value.contains(event.target as Node)) {
      emit('close');
    }
  };

  // 组件挂载时添加事件监听器
  onMounted(() => {
    // 使用 nextTick 确保 DOM 已经渲染
    nextTick(() => {
      document.addEventListener('click', handleClickOutside);
    });
  });

  // 组件卸载时移除事件监听器
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<style scoped>
  /* 卷帘动画样式 */
  .curtain-enter-active {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .curtain-leave-active {
    transition: all 0.25s cubic-bezier(0.55, 0.06, 0.68, 0.19);
  }

  .curtain-enter-from {
    opacity: 0;
    transform: scaleY(0) translateY(-10px);
    transform-origin: top;
  }

  .curtain-enter-to {
    opacity: 1;
    transform: scaleY(1) translateY(0);
    transform-origin: top;
  }

  .curtain-leave-from {
    opacity: 1;
    transform: scaleY(1) translateY(0);
    transform-origin: bottom;
  }

  .curtain-leave-to {
    opacity: 0;
    transform: scaleY(0) translateY(10px);
    transform-origin: bottom;
  }

  /* 点击反馈效果 */
  button {
    position: relative;
    overflow: hidden;
  }

  /* button::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(59, 130, 246, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }

  button:active::after {
    width: 100px;
    height: 100px;
  } */

  /* 确保文字在涟漪效果之上 */
  button > * {
    position: relative;
    z-index: 1;
  }
</style>
