<template>
  <!-- PWA 安装提示横幅 -->
  <div v-if="showInstallPrompt && !showGuide" class="fixed inset-x-4 top-4 z-50">
    <div
      class="rounded-2xl shadow-xl border p-4 flex items-center justify-between theme-transition"
      :style="{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 10px 25px -3px var(--color-shadow)',
      }"
    >
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center"
            :style="{
              background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
            }"
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
          <p class="text-sm font-medium theme-transition" :style="{ color: 'var(--color-text)' }">
            {{ $t('pwa.installGuide.title') }}
          </p>
          <p class="text-xs theme-transition" :style="{ color: 'var(--color-textSecondary)' }">
            {{ $t('pwa.installGuide.subtitle') }}
          </p>
        </div>
      </div>
      <div class="flex space-x-2">
        <button
          @click="dismiss"
          class="px-3 py-1 text-xs transition-colors theme-transition"
          :style="{ color: 'var(--color-textSecondary)' }"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          @click="showInstallGuide"
          class="px-3 py-1 text-xs rounded-lg transition-all"
          :style="{
            background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`,
            color: 'white',
          }"
        >
          {{ $t('pwa.installGuide.tryInstall') }}
        </button>
      </div>
    </div>
  </div>

  <!-- PWA 安装引导 BottomSheet -->
  <BottomSheet
    :visible="showGuide"
    :title="$t('pwa.installGuide.title')"
    :show-close-button="true"
    @close="closeGuide"
  >
    <div class="space-y-6">
      <!-- 平台检测 -->
      <div>
        <div class="flex items-center space-x-2 mb-2">
          <div
            class="w-2 h-2 rounded-full"
            :style="{ backgroundColor: 'var(--color-primary)' }"
          ></div>
          <span
            class="text-sm font-medium theme-transition"
            :style="{ color: 'var(--color-text)' }"
          >
            {{ $t('pwa.installGuide.detectedPlatform') }}
          </span>
        </div>
        <div class="text-lg font-bold theme-transition" :style="{ color: 'var(--color-text)' }">
          {{ platformName }}
        </div>
      </div>

      <!-- 安装步骤 -->
      <div class="space-y-4">
        <div v-for="(step, index) in currentSteps" :key="index" class="flex items-start space-x-3">
          <div
            class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            :style="{
              background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`,
            }"
          >
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <h4 class="font-medium mb-1 theme-transition" :style="{ color: 'var(--color-text)' }">
              {{ step.title }}
            </h4>
            <p
              class="text-sm mb-2 theme-transition"
              :style="{ color: 'var(--color-textSecondary)' }"
            >
              {{ step.description }}
            </p>
            <div
              v-if="step.image"
              class="rounded-lg p-3 mb-2"
              :style="{ backgroundColor: 'var(--color-background)' }"
            >
              <div class="text-center">
                <div class="text-4xl mb-2">{{ step.image }}</div>
                <p
                  class="text-xs theme-transition"
                  :style="{ color: 'var(--color-textSecondary)' }"
                >
                  {{ step.imageDesc }}
                </p>
              </div>
            </div>
            <div
              v-if="step.tip"
              class="border rounded-lg p-2"
              :style="{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-primary)',
              }"
            >
              <p class="text-xs theme-transition" :style="{ color: 'var(--color-primary)' }">
                {{ step.tip }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 安装后说明 -->
      <div
        class="p-4 border rounded-lg"
        :style="{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-primary)',
        }"
      >
        <div class="flex items-center space-x-2 mb-2">
          <svg
            class="w-5 h-5"
            :style="{ color: 'var(--color-primary)' }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h4 class="font-medium theme-transition" :style="{ color: 'var(--color-text)' }">
            {{ $t('pwa.installGuide.afterInstall.title') }}
          </h4>
        </div>
        <p class="text-sm theme-transition" :style="{ color: 'var(--color-textSecondary)' }">
          {{ $t('pwa.installGuide.afterInstall.description') }}
        </p>
      </div>

      <!-- 底部按钮 -->
      <div class="flex space-x-3 pt-4">
        <button
          @click="closeGuide"
          class="flex-1 py-3 px-4 rounded-lg transition-colors theme-transition"
          :style="{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
          }"
        >
          {{ $t('common.close') }}
        </button>
        <button
          @click="tryInstall"
          class="flex-1 py-3 px-4 rounded-lg transition-all"
          :style="{
            background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`,
            color: 'white',
          }"
        >
          {{ $t('pwa.installGuide.tryInstall') }}
        </button>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { showSuccessToast, showFailToast } from 'vant';
  import { useI18n } from 'vue-i18n';
  import BottomSheet from './BottomSheet.vue';

  const { t } = useI18n();

  const showInstallPrompt = ref(false);
  const showGuide = ref(false);
  let deferredPrompt: any = null;

  // 平台检测
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isEdge = /edge/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);

  const platformName = computed(() => {
    if (isIOS) {
      return isSafari ? 'iOS Safari' : 'iOS 浏览器';
    } else if (isAndroid) {
      return isChrome ? 'Android Chrome' : 'Android 浏览器';
    } else if (isChrome) {
      return 'Chrome 浏览器';
    } else if (isEdge) {
      return 'Edge 浏览器';
    } else if (isFirefox) {
      return 'Firefox 浏览器';
    } else if (isSafari) {
      return 'Safari 浏览器';
    } else {
      return '桌面浏览器';
    }
  });

  // 安装步骤类型定义
  interface InstallStep {
    title: string;
    description: string;
    image: string;
    imageDesc: string;
    tip?: string;
  }

  // 安装步骤配置
  const installSteps: { ios: InstallStep[]; android: InstallStep[]; desktop: InstallStep[] } = {
    ios: [
      {
        title: t('pwa.installGuide.steps.ios.step1.title'),
        description: t('pwa.installGuide.steps.ios.step1.description'),
        image: '📱',
        imageDesc: t('pwa.installGuide.steps.ios.step1.imageDesc'),
      },
      {
        title: t('pwa.installGuide.steps.ios.step2.title'),
        description: t('pwa.installGuide.steps.ios.step2.description'),
        image: '⬆️',
        imageDesc: t('pwa.installGuide.steps.ios.step2.imageDesc'),
      },
      {
        title: t('pwa.installGuide.steps.ios.step3.title'),
        description: t('pwa.installGuide.steps.ios.step3.description'),
        image: '➕',
        imageDesc: t('pwa.installGuide.steps.ios.step3.imageDesc'),
        tip: t('pwa.installGuide.steps.ios.step3.tip'),
      },
    ],
    android: [
      {
        title: t('pwa.installGuide.steps.android.step1.title'),
        description: t('pwa.installGuide.steps.android.step1.description'),
        image: '📱',
        imageDesc: t('pwa.installGuide.steps.android.step1.imageDesc'),
      },
      {
        title: t('pwa.installGuide.steps.android.step2.title'),
        description: t('pwa.installGuide.steps.android.step2.description'),
        image: '⋯',
        imageDesc: t('pwa.installGuide.steps.android.step2.imageDesc'),
      },
      {
        title: t('pwa.installGuide.steps.android.step3.title'),
        description: t('pwa.installGuide.steps.android.step3.description'),
        image: '📲',
        imageDesc: t('pwa.installGuide.steps.android.step3.imageDesc'),
      },
    ],
    desktop: [
      {
        title: t('pwa.installGuide.steps.desktop.step1.title'),
        description: t('pwa.installGuide.steps.desktop.step1.description'),
        image: '🔗',
        imageDesc: t('pwa.installGuide.steps.desktop.step1.imageDesc'),
      },
      {
        title: t('pwa.installGuide.steps.desktop.step2.title'),
        description: t('pwa.installGuide.steps.desktop.step2.description'),
        image: '⬇️',
        imageDesc: t('pwa.installGuide.steps.desktop.step2.imageDesc'),
      },
      {
        title: t('pwa.installGuide.steps.desktop.step3.title'),
        description: t('pwa.installGuide.steps.desktop.step3.description'),
        image: '✅',
        imageDesc: t('pwa.installGuide.steps.desktop.step3.imageDesc'),
      },
    ],
  };

  const currentSteps = computed(() => {
    if (isIOS) {
      return installSteps.ios;
    } else if (isAndroid) {
      return installSteps.android;
    } else {
      return installSteps.desktop;
    }
  });

  const showInstallGuide = () => {
    console.log('PWA Install Prompt: 显示安装引导');
    showGuide.value = true;
  };

  const closeGuide = () => {
    showGuide.value = false;
  };

  const tryInstall = async () => {
    console.log('PWA Install Prompt: 用户从引导页面点击安装');
    await install();
  };

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
          // 安装成功后永久隐藏PWA安装提示
          localStorage.setItem('pwa-install-completed', 'true');
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
        showGuide.value = false;
      }
    } else {
      console.log('PWA Install Prompt: 没有可用的安装提示，尝试手动安装');
      // 如果没有 deferredPrompt，尝试手动安装
      showSuccessToast('请使用浏览器的安装功能');
      showInstallPrompt.value = false;
      showGuide.value = false;
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

    // 检查是否已经完成安装（用户点击了安装按钮）
    const installCompleted = localStorage.getItem('pwa-install-completed');
    if (installCompleted === 'true') {
      console.log('PWA Install Prompt: 用户已完成安装，永久隐藏提示');
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
      showGuide.value = false;
      // 安装成功后永久隐藏PWA安装提示
      localStorage.setItem('pwa-install-completed', 'true');
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
