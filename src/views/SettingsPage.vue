<template>
  <div
    class="font-sans flex justify-center items-center px-5 w-full h-screen"
    :class="`theme-gradient-${themeStore.currentTheme}`"
  >
    <!-- 卡片容器 -->
    <div class="card-container w-full h-[70vh] max-w-md">
      <!-- 设置卡片 -->
      <div
        class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative flex flex-col w-full h-full"
      >
        <!-- 顶部状态栏 -->
        <HeaderBar :title="$t('settings.title')" :showBackButton="true" :centerTitle="true" />

        <!-- 内容区域 -->
        <div class="flex-1 flex flex-col p-6 overflow-y-auto">
          <div class="space-y-4">
            <!-- 开发模式开关 - 仅在开发环境下显示 -->
            <div
              v-if="isDevelopment"
              @click="toggleDevMode"
              class="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-800">{{ $t('settings.devMode') }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ $t('settings.devModeDesc') }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <div
                    class="w-12 h-6 rounded-full transition-colors duration-200 relative"
                    :class="devModeStore.isDevModeEnabled ? 'bg-orange-500' : 'bg-gray-300'"
                  >
                    <div
                      class="w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 absolute top-0.5"
                      :class="devModeStore.isDevModeEnabled ? 'translate-x-6' : 'translate-x-0.5'"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 主题设置 -->
            <div
              @click="showThemeSelector = true"
              class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-800">{{ $t('settings.theme') }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ $t('settings.themeDesc') }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-2xl">{{ themeStore.currentThemeData.icon }}</span>
                  <span class="text-purple-400 text-xl">›</span>
                </div>
              </div>
            </div>

            <!-- 语言设置 -->
            <div
              @click="showLanguageSelector = true"
              class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-800">{{ $t('settings.language') }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ $t('settings.languageDesc') }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-blue-400 text-xl">›</span>
                </div>
              </div>
            </div>

            <!-- 关于我们 -->
            <div
              @click="showAboutModal = true"
              class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-800">{{ $t('settings.about') }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ $t('settings.aboutDesc') }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-purple-400 text-xl">›</span>
                </div>
              </div>
            </div>

            <!-- 版本信息 -->
            <div
              class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-800">{{ $t('settings.version') }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ $t('settings.versionDesc') }}</p>
                </div>
                <div class="text-right">
                  <span
                    class="bg-white px-3 py-1 rounded-lg text-green-600 font-medium shadow-sm border border-green-200"
                  >
                    {{ appVersion }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题选择器 BottomSheet -->
    <BottomSheet :visible="showThemeSelector" @close="showThemeSelector = false" maxHeight="80vh">
      <ThemeSelector />
    </BottomSheet>

    <!-- 语言选择器 BottomSheet -->
    <BottomSheet
      :visible="showLanguageSelector"
      @close="showLanguageSelector = false"
      maxHeight="50vh"
    >
      <div class="p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('settings.language') }}</h2>
        <div class="space-y-3">
          <button
            v-for="locale in ['zh-CN', 'en-US']"
            :key="locale"
            @click="changeLanguage(locale)"
            class="w-full flex items-center justify-between p-4 rounded-lg transition-colors"
            :class="
              currentLocale === locale
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'bg-gray-50 hover:bg-gray-100'
            "
          >
            <span class="font-medium text-gray-800">
              {{ $t(`settings.languageOptions.${locale}`) }}
            </span>
            <span v-if="currentLocale === locale" class="text-blue-600">✓</span>
          </button>
        </div>
      </div>
    </BottomSheet>

    <!-- 关于我们模态框 -->
    <BottomSheet :visible="showAboutModal" @close="showAboutModal = false" maxHeight="80vh">
      <div class="p-6">
        <div class="text-center mb-6">
          <div
            class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span class="text-white text-2xl">🍽️</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">{{ $t('app.name') }}</h2>
          <p class="text-gray-600 mt-2">{{ $t('app.description') }}</p>
        </div>

        <!-- 功能特点 -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">
            {{ $t('settings.aboutContent.developer') }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="featureKey in APP_CONFIG.featureKeys"
              :key="featureKey"
              class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <span class="text-lg">{{ $t(featureKey).split(' ')[0] }}</span>
              <span class="text-gray-700">{{ $t(featureKey).split(' ').slice(1).join(' ') }}</span>
            </div>
          </div>
        </div>

        <!-- 联系信息 -->
        <div class="space-y-3">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ $t('settings.aboutContent.contact') }}
          </h3>
          <div class="space-y-3">
            <!-- 邮箱 -->
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3 mb-2">
                <span class="text-gray-500">📧</span>
                <span class="text-gray-700 font-medium">{{
                  $t('settings.aboutContent.email')
                }}</span>
              </div>
              <div class="pl-8">
                <a
                  :href="`mailto:${APP_CONFIG.developer.email}`"
                  class="text-blue-600 hover:text-blue-800 break-all text-sm"
                >
                  {{ APP_CONFIG.developer.email }}
                </a>
              </div>
            </div>

            <!-- GitHub -->
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3 mb-2">
                <span class="text-gray-500">🐙</span>
                <span class="text-gray-700 font-medium">{{
                  $t('settings.aboutContent.github')
                }}</span>
              </div>
              <div class="pl-8">
                <a
                  :href="APP_CONFIG.developer.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-800 break-all text-sm"
                >
                  {{ APP_CONFIG.developer.github }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  import HeaderBar from '@/components/HeaderBar.vue';
  import BottomSheet from '@/components/BottomSheet.vue';
  import ThemeSelector from '@/components/ThemeSelector.vue';
  import { APP_CONFIG } from '@/config/app';
  import { useDevModeStore } from '@/stores/devMode';
  import { useThemeStore } from '@/stores/theme';

  const { locale } = useI18n();
  const devModeStore = useDevModeStore();
  const themeStore = useThemeStore();

  // 页面加载时加载开发模式状态
  onMounted(() => {
    devModeStore.loadDevModeState();
  });

  // 响应式数据
  const showLanguageSelector = ref(false);
  const showThemeSelector = ref(false);
  const showAboutModal = ref(false);

  // 计算属性
  const currentLocale = computed(() => locale.value);
  const appVersion = computed(() => APP_CONFIG.version);
  const isDevelopment = computed(() => import.meta.env.MODE === 'development');

  // 切换语言
  const changeLanguage = (newLocale: string) => {
    locale.value = newLocale;
    localStorage.setItem('locale', newLocale);
    showLanguageSelector.value = false;
  };

  // 切换开发模式
  const toggleDevMode = () => {
    devModeStore.toggleDevMode();
  };
</script>
