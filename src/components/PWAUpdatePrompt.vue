<template>
  <div v-if="needRefresh" class="fixed inset-x-4 bottom-4 z-50">
    <div
      class="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex items-center justify-between"
    >
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              ></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">发现新版本</p>
          <p class="text-xs text-gray-500">点击更新获取最新功能</p>
        </div>
      </div>
      <div class="flex space-x-2">
        <button
          @click="close"
          class="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          稍后
        </button>
        <button
          @click="updateApp"
          class="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
        >
          更新
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // import { ref } from 'vue'; // 暂时不需要
  import { useRegisterSW } from 'virtual:pwa-register/vue';
  import { showSuccessToast } from 'vant';

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const updateApp = async () => {
    try {
      await updateServiceWorker(true);
      showSuccessToast('应用已更新到最新版本');
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  const close = () => {
    needRefresh.value = false;
  };
</script>

<style scoped>
  /* 添加一些动画效果 */
  .fixed {
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
