<template>
  <div class="fixed bottom-4 right-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-sm">
      <h3 class="text-sm font-medium text-gray-900 mb-3">PWA 测试面板</h3>

      <div class="space-y-2 text-xs">
        <div class="flex justify-between">
          <span>Service Worker:</span>
          <span :class="swSupported ? 'text-green-600' : 'text-red-600'">
            {{ swSupported ? '✅ 支持' : '❌ 不支持' }}
          </span>
        </div>

        <div class="flex justify-between">
          <span>beforeinstallprompt:</span>
          <span :class="beforeInstallSupported ? 'text-green-600' : 'text-red-600'">
            {{ beforeInstallSupported ? '✅ 支持' : '❌ 不支持' }}
          </span>
        </div>

        <div class="flex justify-between">
          <span>HTTPS:</span>
          <span :class="isHttps ? 'text-green-600' : 'text-red-600'">
            {{ isHttps ? '✅ 是' : '❌ 否' }}
          </span>
        </div>

        <div class="flex justify-between">
          <span>已安装:</span>
          <span :class="isInstalled ? 'text-green-600' : 'text-red-600'">
            {{ isInstalled ? '✅ 是' : '❌ 否' }}
          </span>
        </div>

        <div class="flex justify-between">
          <span>Manifest:</span>
          <span :class="hasManifest ? 'text-green-600' : 'text-red-600'">
            {{ hasManifest ? '✅ 有' : '❌ 无' }}
          </span>
        </div>
      </div>

      <div class="mt-3 space-y-2">
        <button
          @click="testInstall"
          class="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
        >
          测试安装提示
        </button>

        <button
          @click="showDebugInfo"
          class="w-full px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
        >
          显示调试信息
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  const swSupported = ref(false);
  const beforeInstallSupported = ref(false);
  const isHttps = ref(false);
  const isInstalled = ref(false);
  const hasManifest = ref(false);

  const testInstall = () => {
    console.log('=== PWA 安装测试 ===');
    console.log('Service Worker 支持:', 'serviceWorker' in navigator);
    console.log('beforeinstallprompt 支持:', 'beforeinstallprompt' in window);
    console.log('HTTPS:', location.protocol === 'https:' || location.hostname === 'localhost');
    console.log('已安装:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('Manifest:', !!document.querySelector('link[rel="manifest"]'));

    // 触发 beforeinstallprompt 事件（如果支持）
    if ('beforeinstallprompt' in window) {
      console.log('尝试触发 beforeinstallprompt 事件...');
      // 这里不能手动触发，但可以检查是否有待处理的提示
    }
  };

  const showDebugInfo = () => {
    console.log('=== PWA 调试信息 ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Platform:', navigator.platform);
    console.log('Language:', navigator.language);
    console.log('Cookie Enabled:', navigator.cookieEnabled);
    console.log('Online:', navigator.onLine);
    console.log('Connection:', (navigator as any).connection);
  };

  onMounted(() => {
    // 检查各项支持情况
    swSupported.value = 'serviceWorker' in navigator;
    beforeInstallSupported.value = 'beforeinstallprompt' in window;
    isHttps.value = location.protocol === 'https:' || location.hostname === 'localhost';
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches;
    hasManifest.value = !!document.querySelector('link[rel="manifest"]');

    console.log('PWA 测试面板已加载');
  });
</script>
