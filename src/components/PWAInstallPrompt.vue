<template>
  <div v-if="showInstallPrompt" class="fixed inset-x-4 top-4 z-50">
    <div
      class="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex items-center justify-between"
    >
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">安装到桌面</p>
          <p class="text-xs text-gray-500">快速访问「今天吃什么」</p>
        </div>
      </div>
      <div class="flex space-x-2">
        <button
          @click="dismiss"
          class="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          取消
        </button>
        <button
          @click="install"
          class="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
        >
          安装
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { showSuccessToast, showFailToast } from 'vant';

  const showInstallPrompt = ref(false);
  let deferredPrompt: any = null;

  const install = async () => {
    console.log('PWA Install Prompt: 用户点击安装按钮');

    if (deferredPrompt) {
      try {
        console.log('PWA Install Prompt: 触发安装提示');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('PWA Install Prompt: 用户接受安装');
          showSuccessToast('应用安装成功！');
        } else {
          console.log('PWA Install Prompt: 用户取消安装');
          showFailToast('安装已取消');
        }
      } catch (error) {
        console.error('PWA Install Prompt: 安装失败:', error);
        showFailToast('安装失败，请稍后再试');
      } finally {
        deferredPrompt = null;
        showInstallPrompt.value = false;
      }
    } else {
      console.log('PWA Install Prompt: 没有可用的安装提示，尝试手动安装');
      // 如果没有 deferredPrompt，尝试手动安装
      showSuccessToast('请使用浏览器的安装功能');
      showInstallPrompt.value = false;
    }
  };

  const dismiss = () => {
    showInstallPrompt.value = false;
    // 24小时后再次显示
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  onMounted(() => {
    console.log('PWA Install Prompt: 组件已挂载');

    // 检查是否已经安装
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA Install Prompt: 应用已安装，跳过提示');
      return;
    }

    // 检查是否最近被忽略
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
      console.log('PWA Install Prompt: 用户最近忽略了安装提示');
      return;
    }

    // 检查 PWA 安装条件
    const checkInstallability = () => {
      console.log('PWA Install Prompt: 检查安装条件...');

      // 检查是否支持 Service Worker
      if (!('serviceWorker' in navigator)) {
        console.log('PWA Install Prompt: 不支持 Service Worker');
        return;
      }
      console.log('PWA Install Prompt: ✅ 支持 Service Worker');

      // 检查是否支持 beforeinstallprompt 事件
      if (!('beforeinstallprompt' in window)) {
        console.log('PWA Install Prompt: 不支持 beforeinstallprompt 事件');
        // 如果支持 PWA 但不支持 beforeinstallprompt，可以手动显示提示
        setTimeout(() => {
          if (!showInstallPrompt.value) {
            console.log('PWA Install Prompt: 手动显示安装提示');
            showInstallPrompt.value = true;
          }
        }, 3000);
        return;
      }
      console.log('PWA Install Prompt: ✅ 支持 beforeinstallprompt 事件');

      // 检查是否已经安装
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('PWA Install Prompt: 应用已安装');
        return;
      }
      console.log('PWA Install Prompt: ✅ 应用未安装');

      // 检查 HTTPS
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.log('PWA Install Prompt: 需要 HTTPS 环境');
        return;
      }
      console.log('PWA Install Prompt: ✅ HTTPS 环境');

      console.log('PWA Install Prompt: 等待 beforeinstallprompt 事件');
    };

    // 监听 beforeinstallprompt 事件
    window.addEventListener('beforeinstallprompt', e => {
      console.log('PWA Install Prompt: beforeinstallprompt 事件触发');
      e.preventDefault();
      deferredPrompt = e;
      showInstallPrompt.value = true;
    });

    // 监听 appinstalled 事件
    window.addEventListener('appinstalled', () => {
      console.log('PWA Install Prompt: 应用已安装');
      showSuccessToast('应用已成功安装到桌面！');
      showInstallPrompt.value = false;
    });

    // 检查安装条件
    checkInstallability();
  });
</script>

<style scoped>
  .fixed {
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
