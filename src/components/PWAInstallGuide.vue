<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-[90%] max-h-[80vh] overflow-hidden">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg">{{ $t('pwa.installGuide.title') }}</h3>
              <p class="text-sm opacity-90">{{ $t('pwa.installGuide.subtitle') }}</p>
            </div>
          </div>
          <button @click="close" class="text-white hover:text-gray-200 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="p-4 overflow-y-auto max-h-[60vh]">
        <!-- 平台检测 -->
        <div class="mb-4">
          <div class="flex items-center space-x-2 mb-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-sm font-medium text-gray-700">{{
              $t('pwa.installGuide.detectedPlatform')
            }}</span>
          </div>
          <div class="text-lg font-bold text-gray-800">{{ platformName }}</div>
        </div>

        <!-- 安装步骤 -->
        <div class="space-y-4">
          <div
            v-for="(step, index) in currentSteps"
            :key="index"
            class="flex items-start space-x-3"
          >
            <div
              class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-800 mb-1">{{ step.title }}</h4>
              <p class="text-sm text-gray-600 mb-2">{{ step.description }}</p>
              <div v-if="step.image" class="bg-gray-50 rounded-lg p-3 mb-2">
                <div class="text-center">
                  <div class="text-4xl mb-2">{{ step.image }}</div>
                  <p class="text-xs text-gray-500">{{ step.imageDesc }}</p>
                </div>
              </div>
              <div v-if="step.tip" class="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p class="text-xs text-blue-700">{{ step.tip }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 安装后说明 -->
        <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center space-x-2 mb-2">
            <svg
              class="w-5 h-5 text-green-600"
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
            <h4 class="font-medium text-green-800">
              {{ $t('pwa.installGuide.afterInstall.title') }}
            </h4>
          </div>
          <p class="text-sm text-green-700">
            {{ $t('pwa.installGuide.afterInstall.description') }}
          </p>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 bg-gray-50">
        <div class="flex space-x-3">
          <button
            @click="close"
            class="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {{ $t('common.close') }}
          </button>
          <button
            @click="tryInstall"
            class="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
          >
            {{ $t('pwa.installGuide.tryInstall') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['close', 'install']);

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

  const close = () => {
    emit('close');
  };

  const tryInstall = () => {
    emit('install');
    close();
  };
</script>

<style scoped>
  /* 滚动条样式 */
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>
