<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="typeof route.meta?.transition === 'string' ? route.meta.transition : 'slide'"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>

  <!-- PWA 功能组件 -->
  <PWAInstallPrompt />
  <PWAUpdatePrompt />

  <!-- 全局 Loading 组件 -->
  <LoadingModal
    :visible="loadingState.visible"
    :text="loadingState.text"
    :type="loadingState.type"
    :progress="loadingState.progress"
    :show-progress="loadingState.showProgress"
    :show-progress-text="loadingState.showProgressText"
    :progress-text="loadingState.progressText"
    :closable="loadingState.closable"
    :backdrop-closable="loadingState.backdropClosable"
    :spinner-color="loadingState.spinnerColor"
    :text-color="loadingState.textColor"
    :modal-background-color="loadingState.modalBackgroundColor"
    :backdrop-color="loadingState.backdropColor"
    :border-color="loadingState.borderColor"
    :shadow-color="loadingState.shadowColor"
    :progress-color="loadingState.progressColor"
    :progress-background-color="loadingState.progressBackgroundColor"
    :text-secondary-color="loadingState.textSecondaryColor"
    @close="closeLoading"
  />

  <!-- 全局登录提示弹窗 -->
  <LoginPromptModal
    :visible="loginPromptState.showLoginPrompt.value"
    @close="loginPromptState.hideLoginPromptModal"
    @cancel="loginPromptState.handleLoginPromptCancel"
    @login="loginPromptState.handleLoginPromptLogin"
  />
</template>

<script setup lang="ts">
  import PWAUpdatePrompt from '@/components/PWAUpdatePrompt.vue';
  import PWAInstallPrompt from '@/components/PWAInstallPrompt.vue';
  import LoadingModal from '@/components/LoadingModal.vue';
  import LoginPromptModal from '@/components/LoginPromptModal.vue';
  import { useLoading } from '@/composables/useLoading';
  import { useLoginPrompt } from '@/composables/useLoginPrompt';

  // 使用全局 loading
  const { loadingState, close } = useLoading();

  // 使用全局登录提示
  const loginPromptState = useLoginPrompt();

  const closeLoading = () => {
    close();
  };
</script>

<style>
  /* 滑动转场效果 */
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
  }

  .slide-enter-from {
    opacity: 0;
    transform: translateX(100%);
  }

  .slide-leave-to {
    opacity: 0;
    transform: translateX(-100%);
  }

  /* 淡入淡出效果 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
