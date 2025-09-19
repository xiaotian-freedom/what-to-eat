<template>
  <div
    class="font-sans flex justify-center items-center px-5 w-full h-screen"
    :class="`theme-gradient-${themeStore.currentTheme}`"
  >
    <!-- 卡片容器 -->
    <div class="card-container w-full h-[80vh] max-w-md">
      <!-- 反馈卡片 -->
      <div
        class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative flex flex-col w-full h-full"
      >
        <!-- 顶部状态栏 -->
        <HeaderBar :title="$t('feedback.title')" :showBackButton="true" :centerTitle="true" />

        <!-- 内容区域 -->
        <div class="flex-1 flex flex-col p-6 overflow-y-auto">
          <div class="space-y-6">
            <!-- 欢迎信息 -->
            <div class="text-center">
              <div
                class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                :style="{
                  background: `linear-gradient(135deg, ${getTransparentColor(
                    'primary',
                    0.2
                  )}, ${getTransparentColor('secondary', 0.2)})`,
                }"
              >
                <span class="text-4xl">💬</span>
              </div>
              <h2
                class="text-xl font-bold mb-2"
                :style="{ color: themeStore.currentThemeData.colors.text }"
              >
                {{ $t('feedback.welcome') }}
              </h2>
              <p
                class="text-sm"
                :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
              >
                {{ $t('feedback.welcomeDesc') }}
              </p>
            </div>

            <!-- 反馈表单 -->
            <div class="space-y-4">
              <!-- 反馈标题 -->
              <div>
                <label
                  class="block text-sm font-medium mb-2"
                  :style="{ color: themeStore.currentThemeData.colors.text }"
                >
                  {{ $t('feedback.feedbackTitle') }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="feedbackTitle"
                  type="text"
                  :placeholder="$t('feedback.titlePlaceholder')"
                  class="w-full p-4 !text-black border-2 border-gray-200 rounded-xl focus:outline-none transition-colors duration-200"
                  :style="{
                    'border-color': feedbackTitle
                      ? themeStore.currentThemeData.colors.primary
                      : '#e5e7eb',
                  }"
                  maxlength="100"
                />
                <div class="flex justify-between items-center mt-1">
                  <span
                    class="text-xs"
                    :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
                    >{{ $t('feedback.titleTip') }}</span
                  >
                  <span
                    class="text-xs"
                    :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
                    >{{ feedbackTitle.length }}/100</span
                  >
                </div>
              </div>

              <!-- 反馈类型 -->
              <div>
                <label
                  class="block text-sm font-medium mb-2"
                  :style="{ color: themeStore.currentThemeData.colors.text }"
                >
                  {{ $t('feedback.type') }}
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <div
                    v-for="type in feedbackTypes"
                    :key="type.value"
                    @click="selectedType = type.value"
                    class="relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                    :class="
                      selectedType === type.value ? 'theme-border-primary' : 'hover:border-gray-300'
                    "
                    :style="{
                      backgroundColor:
                        selectedType === type.value
                          ? 'var(--color-primary-light, rgba(99, 102, 241, 0.1))'
                          : 'var(--color-surface)',
                      borderColor:
                        selectedType === type.value
                          ? 'var(--color-primary)'
                          : 'var(--color-border)',
                    }"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <span class="text-xl">{{ type.icon }}</span>
                      </div>
                      <div class="flex-1">
                        <h3 class="text-sm font-semibold" style="color: var(--color-text)">
                          {{ type.label }}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 优先级选择 -->
              <div>
                <label
                  class="block text-sm font-medium mb-2"
                  :style="{ color: themeStore.currentThemeData.colors.text }"
                >
                  {{ $t('feedback.priority') }}
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <div
                    v-for="priority in priorityOptions"
                    :key="priority.value"
                    @click="selectedPriority = priority.value"
                    class="relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                    :class="
                      selectedPriority === priority.value
                        ? 'theme-border-secondary'
                        : 'hover:border-gray-300'
                    "
                    :style="{
                      backgroundColor:
                        selectedPriority === priority.value
                          ? 'var(--color-secondary-light, rgba(139, 92, 246, 0.1))'
                          : 'var(--color-surface)',
                      borderColor:
                        selectedPriority === priority.value
                          ? 'var(--color-secondary)'
                          : 'var(--color-border)',
                    }"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div
                          class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                          :style="{
                            backgroundColor:
                              selectedPriority === priority.value
                                ? 'var(--color-secondary-light, rgba(139, 92, 246, 0.15))'
                                : 'var(--color-border)',
                          }"
                        >
                          <img
                            :src="priority.icon"
                            :alt="priority.label"
                            class="w-6 h-6"
                            :style="{
                              filter:
                                selectedPriority === priority.value ? 'none' : 'brightness(0.6)',
                            }"
                          />
                        </div>
                      </div>
                      <div class="flex-1">
                        <h3
                          class="text-sm font-semibold"
                          :class="[
                            priority.color,
                            selectedPriority === priority.value ? 'font-bold' : 'font-semibold',
                          ]"
                        >
                          {{ priority.label }}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 反馈内容 -->
              <div>
                <label
                  class="block text-sm font-medium mb-2"
                  :style="{ color: themeStore.currentThemeData.colors.text }"
                >
                  {{ $t('feedback.content') }}
                  <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="feedbackContent"
                  :placeholder="$t('feedback.contentPlaceholder')"
                  class="w-full h-32 p-4 !text-black border-2 border-gray-200 rounded-xl resize-none focus:outline-none transition-colors duration-200"
                  :style="{
                    'border-color': feedbackContent
                      ? themeStore.currentThemeData.colors.primary
                      : '#e5e7eb',
                  }"
                  maxlength="500"
                ></textarea>
                <div class="flex justify-between items-center mt-1">
                  <span
                    class="text-xs"
                    :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
                    >{{ $t('feedback.contentTip') }}</span
                  >
                  <span
                    class="text-xs"
                    :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
                    >{{ feedbackContent.length }}/500</span
                  >
                </div>
              </div>

              <!-- 联系方式（可选） -->
              <div>
                <label
                  class="block text-sm font-medium mb-2"
                  :style="{ color: themeStore.currentThemeData.colors.text }"
                >
                  {{ $t('feedback.contact') }}
                  <span
                    class="text-xs"
                    :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
                    >({{ $t('common.optional') }})</span
                  >
                </label>
                <input
                  v-model="contactInfo"
                  type="text"
                  :placeholder="$t('feedback.contactPlaceholder')"
                  class="w-full p-4 !text-black border-2 border-gray-200 rounded-xl focus:outline-none transition-colors duration-200"
                  :style="{
                    'border-color': contactInfo
                      ? themeStore.currentThemeData.colors.primary
                      : '#e5e7eb',
                  }"
                  maxlength="100"
                />
                <p
                  class="text-xs mt-1"
                  :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
                >
                  {{ $t('feedback.contactTip') }}
                </p>
              </div>

              <!-- 设备信息 -->
              <div
                class="rounded-xl p-4"
                :style="{ backgroundColor: getTransparentColor('primary', 0.05) }"
              >
                <div class="flex items-center justify-between mb-2">
                  <h3
                    class="text-sm font-medium"
                    :style="{ color: themeStore.currentThemeData.colors.text }"
                  >
                    {{ $t('feedback.deviceInfo') }}
                  </h3>
                  <button
                    @click="showDetailedInfo = !showDetailedInfo"
                    class="text-xs transition-colors"
                    :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
                  >
                    {{ showDetailedInfo ? $t('feedback.hideDetails') : $t('feedback.showDetails') }}
                  </button>
                </div>

                <!-- 基础信息 -->
                <div
                  class="space-y-1 text-xs"
                  :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
                >
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.device') }}:</span>
                    <span class="text-right max-w-[60%] break-words">{{ deviceInfo.device }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.browser') }}:</span>
                    <span class="text-right max-w-[60%] break-words">{{ deviceInfo.browser }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.version') }}:</span>
                    <span>{{ deviceInfo.version }}</span>
                  </div>
                </div>

                <!-- 详细信息（可折叠） -->
                <div
                  v-if="showDetailedInfo"
                  class="mt-3 pt-3 space-y-1 text-xs"
                  :style="{
                    borderTop: `1px solid ${themeStore.currentThemeData.colors.border}`,
                    color: themeStore.currentThemeData.colors.textSecondary,
                  }"
                >
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.screenResolution') }}:</span>
                    <span>{{ deviceInfo.screenResolution }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.viewportSize') }}:</span>
                    <span>{{ deviceInfo.viewportSize }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.pwaMode') }}:</span>
                    <span>{{ deviceInfo.isPWA }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.networkType') }}:</span>
                    <span>{{ deviceInfo.networkType }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.memoryInfo') }}:</span>
                    <span>{{ deviceInfo.memoryInfo }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.timezone') }}:</span>
                    <span>{{ deviceInfo.timezone }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('feedback.language') }}:</span>
                    <span>{{ deviceInfo.language }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="pt-4">
              <button
                @click="handleSubmit"
                :disabled="!canSubmit"
                class="w-full text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                :style="
                  !canSubmit
                    ? {
                        background: 'linear-gradient(to right, #d1d5db, #9ca3af)',
                      }
                    : {
                        background: `linear-gradient(to right, ${themeStore.currentThemeData.colors.primary}, ${themeStore.currentThemeData.colors.secondary})`,
                      }
                "
              >
                <span>{{ $t('feedback.submit') }}</span>
              </button>
            </div>

            <!-- 感谢信息 -->
            <div class="text-center pt-2">
              <p
                class="text-xs"
                :style="{ color: themeStore.currentThemeData.colors.textSecondary }"
              >
                {{ $t('feedback.thankYou') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { showSuccessToast, showFailToast } from 'vant';
  import HeaderBar from '@/components/HeaderBar.vue';
  import { useThemeStore } from '@/stores/theme';
  import { submitFeedback } from '@/utils/feedbackApi';
  import { FeedbackType, FeedbackPriority, Platform } from '@/types/feedback';
  import { APP_CONFIG } from '@/config/app';
  import { getTransparentColor } from '@/utils/colorUtils';
  import { useLoading } from '@/composables/useLoading';

  const themeStore = useThemeStore();
  const { t: $t } = useI18n();
  const { show: showLoading, hide: hideLoading } = useLoading();

  // 反馈类型选项
  const feedbackTypes = [
    { value: FeedbackType.BUG_REPORT, label: $t('feedback.types.bug'), icon: '🐛' },
    { value: FeedbackType.SUGGESTION, label: $t('feedback.types.feature'), icon: '💡' },
    { value: FeedbackType.EXPERIENCE, label: $t('feedback.types.improvement'), icon: '⚡' },
    { value: FeedbackType.OTHER, label: $t('feedback.types.other'), icon: '💬' },
  ];

  // 优先级选项
  const priorityOptions = [
    {
      value: FeedbackPriority.LOW,
      label: $t('feedback.priority.low'),
      color: 'text-green-600',
      icon: '/src/assets/icons/priority-low.svg',
    },
    {
      value: FeedbackPriority.MEDIUM,
      label: $t('feedback.priority.medium'),
      color: 'text-yellow-600',
      icon: '/src/assets/icons/priority-medium.svg',
    },
    {
      value: FeedbackPriority.HIGH,
      label: $t('feedback.priority.high'),
      color: 'text-orange-600',
      icon: '/src/assets/icons/priority-high.svg',
    },
    {
      value: FeedbackPriority.URGENT,
      label: $t('feedback.priority.urgent'),
      color: 'text-red-600',
      icon: '/src/assets/icons/priority-urgent.svg',
    },
  ];

  // 响应式数据
  const selectedType = ref(FeedbackType.BUG_REPORT);
  const selectedPriority = ref(FeedbackPriority.MEDIUM);
  const feedbackTitle = ref('');
  const feedbackContent = ref('');
  const contactInfo = ref('');
  const showDetailedInfo = ref(false);

  // 设备信息
  const deviceInfo = ref({
    device: '',
    browser: '',
    version: '1.0.0',
    screenResolution: '',
    viewportSize: '',
    isPWA: '',
    networkType: '',
    memoryInfo: '',
    timezone: '',
    language: '',
    userAgent: '',
  });

  // 计算属性
  const canSubmit = computed(() => {
    return feedbackTitle.value.trim().length >= 3 && feedbackContent.value.trim().length >= 10;
  });

  // 获取设备信息
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;

    // 检测设备类型和操作系统
    let device = 'Desktop';
    let os = 'Unknown';

    if (/iPad/.test(userAgent)) {
      device = 'iPad';
      os = 'iOS';
    } else if (/iPhone/.test(userAgent)) {
      device = 'iPhone';
      os = 'iOS';
    } else if (/Android/.test(userAgent)) {
      device = 'Android';
      os = 'Android';
      // 尝试获取Android版本
      const androidMatch = userAgent.match(/Android\s([0-9\.]+)/);
      if (androidMatch) {
        os = `Android ${androidMatch[1]}`;
      }
    } else if (/Windows/.test(userAgent)) {
      device = 'Desktop';
      os = 'Windows';
      // 尝试获取Windows版本
      if (/Windows NT 10.0/.test(userAgent)) {
        os = 'Windows 10/11';
      } else if (/Windows NT 6.3/.test(userAgent)) {
        os = 'Windows 8.1';
      } else if (/Windows NT 6.1/.test(userAgent)) {
        os = 'Windows 7';
      }
    } else if (/Mac OS X/.test(userAgent)) {
      device = 'Desktop';
      os = 'macOS';
      // 尝试获取macOS版本
      const macMatch = userAgent.match(/Mac OS X\s([0-9_]+)/);
      if (macMatch) {
        const version = macMatch[1].replace(/_/g, '.');
        os = `macOS ${version}`;
      }
    } else if (/Linux/.test(userAgent)) {
      device = 'Desktop';
      os = 'Linux';
    } else if (/Mobile/.test(userAgent)) {
      device = 'Mobile';
    }

    // 检测浏览器和版本
    let browser = 'Unknown';
    let browserVersion = '';

    if (userAgent.includes('Edg/')) {
      browser = 'Edge';
      const edgeMatch = userAgent.match(/Edg\/([0-9\.]+)/);
      if (edgeMatch) {
        browserVersion = edgeMatch[1];
      }
    } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
      browser = 'Chrome';
      const chromeMatch = userAgent.match(/Chrome\/([0-9\.]+)/);
      if (chromeMatch) {
        browserVersion = chromeMatch[1];
      }
    } else if (userAgent.includes('Firefox/')) {
      browser = 'Firefox';
      const firefoxMatch = userAgent.match(/Firefox\/([0-9\.]+)/);
      if (firefoxMatch) {
        browserVersion = firefoxMatch[1];
      }
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
      browser = 'Safari';
      const safariMatch = userAgent.match(/Version\/([0-9\.]+)/);
      if (safariMatch) {
        browserVersion = safariMatch[1];
      }
    }

    // 获取屏幕分辨率
    const screenResolution = `${screen.width}x${screen.height}`;

    // 获取视口大小
    const viewportSize = `${window.innerWidth}x${window.innerHeight}`;

    // 检测是否为PWA模式
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // 检测网络连接类型
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    const networkType = connection
      ? connection.effectiveType || connection.type || 'Unknown'
      : 'Unknown';

    // 检测内存信息（如果支持）
    const memory = (performance as any).memory;
    const memoryInfo = memory
      ? `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(
          memory.totalJSHeapSize / 1024 / 1024
        )}MB`
      : 'N/A';

    // 检测时区
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 检测语言
    const language = navigator.language || navigator.languages?.[0] || 'Unknown';

    // 检测平台
    let platform = Platform.UNKNOWN;
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      platform = Platform.IOS;
    } else if (/Android/.test(userAgent)) {
      platform = Platform.ANDROID;
    } else {
      platform = Platform.WEB;
    }

    deviceInfo.value = {
      device: `${device} (${os})`,
      browser: browserVersion ? `${browser} ${browserVersion}` : browser,
      version: APP_CONFIG.version, // 从package.json获取的版本号
      screenResolution,
      viewportSize,
      isPWA: isPWA ? 'Yes' : 'No',
      networkType,
      memoryInfo,
      timezone,
      language,
      userAgent: userAgent.substring(0, 100) + '...', // 截取前100个字符
    };

    // 返回平台信息供API使用
    return platform;
  };

  // 提交反馈
  const handleSubmit = async () => {
    if (!canSubmit.value) return;

    try {
      // 显示全局 loading
      showLoading({
        text: 'feedback.submitting',
        closable: false,
        backdropClosable: false,
      });

      // 获取平台信息
      const platform = getDeviceInfo();

      // 构建反馈数据
      const feedbackData = {
        title: feedbackTitle.value.trim(),
        content: feedbackContent.value.trim(),
        feedback_type: selectedType.value,
        priority: selectedPriority.value,
        contact_email: contactInfo.value.trim() || undefined,
        contact_phone: undefined, // 暂时不支持电话
        device_info: JSON.stringify(deviceInfo.value),
        app_version: APP_CONFIG.version,
        platform: platform,
      };

      // 调用API提交反馈
      const response = await submitFeedback(feedbackData);
      // 等待1秒
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 从响应中获取数据
      if (response.code === 200) {
        // 显示成功消息
        showSuccessToast(response.data?.message || response.msg || $t('feedback.submitSuccess'));

        // 重置表单
        selectedType.value = FeedbackType.BUG_REPORT;
        selectedPriority.value = FeedbackPriority.MEDIUM;
        feedbackTitle.value = '';
        feedbackContent.value = '';
        contactInfo.value = '';
      } else {
        // 显示错误消息
        showFailToast(response.data?.message || response.msg || $t('feedback.submitFailed'));
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      showFailToast($t('feedback.submitFailed'));
    } finally {
      // 隐藏全局 loading
      hideLoading();
    }
  };

  // 页面加载时获取设备信息
  onMounted(() => {
    getDeviceInfo();
  });
</script>
