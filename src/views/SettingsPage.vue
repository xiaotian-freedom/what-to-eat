<template>
  <div
    class="font-sans flex justify-center items-center px-5 w-full h-screen"
    :class="`theme-gradient-${themeStore.currentTheme}`"
  >
    <!-- 卡片容器 -->
    <div class="card-container w-full h-[80vh] max-w-md">
      <!-- 设置卡片 -->
      <div
        class="card-face bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-gray-100 relative flex flex-col w-full h-full"
      >
        <!-- 顶部状态栏 -->
        <HeaderBar :title="$t('settings.title')" :showBackButton="true" :centerTitle="true" />

        <!-- 内容区域 -->
        <div class="flex-1 flex flex-col p-6 overflow-y-auto">
          <div class="space-y-4">
            <!-- 用户信息模块 - 移到最上面并突出样式 -->
            <div
              v-if="userStore.isAuthenticated"
              class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-200 shadow-lg relative overflow-hidden"
            >
              <!-- 装饰性背景元素 -->
              <div
                class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-10 translate-x-10"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-200/30 to-blue-200/30 rounded-full translate-y-8 -translate-x-8"
              ></div>

              <div class="relative z-10">
                <!-- 用户头像和基本信息 -->
                <div class="flex items-center space-x-4 mb-4">
                  <div class="relative">
                    <img
                      v-if="userStore.avatar_url"
                      :src="userStore.avatar_url"
                      :alt="userStore.username"
                      class="w-16 h-16 rounded-full border-3 border-white shadow-lg object-cover"
                    />
                    <div
                      v-else
                      class="w-16 h-16 rounded-full border-3 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100"
                    >
                      <img
                        src="@/assets/icons/default-avatar.svg"
                        alt="默认头像"
                        class="w-10 h-10"
                      />
                    </div>
                    <!-- 在线状态指示器 -->
                    <div
                      class="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-2 border-white rounded-full"
                    ></div>
                  </div>

                  <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-800 mb-1">{{ userStore.username }}</h3>
                    <p class="text-sm text-gray-600 mb-1">
                      {{ userStore.email || userStore.phone }}
                    </p>
                    <div class="flex items-center space-x-2">
                      <span
                        class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium"
                      >
                        {{ $t('settings.member') }}
                      </span>
                      <span
                        class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium"
                      >
                        {{ $t('settings.active') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- AI使用情况 -->
                <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">{{
                      $t('settings.aiUsage')
                    }}</span>
                    <span class="text-sm text-gray-600">
                      {{ userStore.remainingAIUses }}/{{ userStore.maxDailyAIUses }}
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      :style="{
                        width: `${(userStore.remainingAIUses / userStore.maxDailyAIUses) * 100}%`,
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 开发模式开关 - 开关可见时显示 -->
            <div
              v-if="devModeStore.isDevModeSwitchVisible"
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

            <!-- 抽奖模式设置 -->
            <div
              @click="showModeSelector = true"
              class="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-800">
                    {{ $t('settings.selectionMode') }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">{{ $t('settings.selectionModeDesc') }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-2xl">{{ wheelModeStore.isWheelMode() ? '🎡' : '🃏' }}</span>
                  <span class="text-green-400 text-xl">›</span>
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
                  <span class="text-2xl">{{ currentLanguageIcon }}</span>
                  <span class="text-blue-400 text-xl">›</span>
                </div>
              </div>
            </div>

            <!-- 我的收藏 -->
            <div
              @click="handleFavoriteClick"
              class="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-4 border border-pink-100 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-800">{{ $t('favorite.title') }}</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ $t('favorite.count', { count: favoriteStore.favoriteCount }) }}
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-2xl">💖</span>
                  <span class="text-red-400 text-xl">›</span>
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

            <!-- 登出按钮 -->
            <div
              v-if="userStore.isAuthenticated"
              class="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border border-red-100"
            >
              <button
                @click="showLogoutConfirm = true"
                class="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                <span>{{ $t('settings.logout') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题选择器 BottomSheet -->
    <ThemeSelectorBottomSheet
      :visible="showThemeSelector"
      @close="showThemeSelector = false"
      @select="handleThemeSelect"
    />

    <!-- 语言选择器 BottomSheet -->
    <LanguageSelectorBottomSheet
      :visible="showLanguageSelector"
      @close="showLanguageSelector = false"
      @select="handleLanguageSelect"
    />

    <!-- 抽奖模式选择器 BottomSheet -->
    <ModeSelectionBottomSheet :visible="showModeSelector" @close="showModeSelector = false" />

    <!-- 关于我们 -->
    <AboutBottomSheet :visible="showAboutModal" @close="showAboutModal = false" />

    <!-- 登出确认弹窗 -->
    <van-dialog
      v-model:show="showLogoutConfirm"
      :message="$t('settings.logoutConfirmMessage')"
      :show-cancel-button="false"
      :show-confirm-button="false"
      confirm-button-color="#ef4444"
      @confirm="handleLogout"
    >
      <template #default>
        <div class="p-6 text-center">
          <div
            class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
          >
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            {{ $t('settings.logoutConfirm') }}
          </h3>
          <p class="text-gray-600 mb-4">{{ $t('settings.logoutConfirmMessage') }}</p>
          <div class="flex space-x-3">
            <button
              @click="showLogoutConfirm = false"
              class="flex-1 bg-gray-200 active:bg-gray-300 !text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-150 active:scale-95 touch-manipulation"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="handleLogout"
              :disabled="isLoggingOut"
              class="flex-1 bg-gradient-to-r from-red-500 to-pink-500 active:from-red-600 active:to-pink-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-150 active:scale-95 touch-manipulation shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg v-if="isLoggingOut" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ isLoggingOut ? $t('common.loggingOut') : $t('settings.logout') }}</span>
            </button>
          </div>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { showFailToast } from 'vant';
  import HeaderBar from '@/components/HeaderBar.vue';
  import ThemeSelectorBottomSheet from '@/components/ThemeSelectorBottomSheet.vue';
  import LanguageSelectorBottomSheet from '@/components/LanguageSelectorBottomSheet.vue';
  import AboutBottomSheet from '@/components/AboutBottomSheet.vue';
  import ModeSelectionBottomSheet from '@/components/ModeSelectionBottomSheet.vue';
  import { useDevModeStore } from '@/stores/devMode';
  import { useThemeStore } from '@/stores/theme';
  import { useWheelModeStore } from '@/stores/wheelMode';
  import { useUserStore } from '@/stores/user';
  import { useFavoriteStore } from '@/stores/favorite';
  import { useLoading } from '@/composables/useLoading';

  const devModeStore = useDevModeStore();
  const themeStore = useThemeStore();
  const wheelModeStore = useWheelModeStore();
  const userStore = useUserStore();
  const favoriteStore = useFavoriteStore();
  const router = useRouter();
  const { locale, t: $t } = useI18n();
  const { show: showLoading, hide: hideLoading } = useLoading();

  // 获取当前语言图标
  const currentLanguageIcon = computed(() => {
    return locale.value === 'zh-CN' ? '🇨🇳' : '🇺🇸';
  });

  // 页面加载时加载开发模式状态
  onMounted(() => {
    devModeStore.loadDevModeState();
    wheelModeStore.loadModeSettings();
    favoriteStore.loadFavorites();
  });

  // 响应式数据
  const showLanguageSelector = ref(false);
  const showThemeSelector = ref(false);
  const showAboutModal = ref(false);
  const showModeSelector = ref(false);
  const showLogoutConfirm = ref(false);
  const isLoggingOut = ref(false);

  // 处理语言选择
  const handleLanguageSelect = () => {
    showLanguageSelector.value = false;
  };

  // 处理主题选择
  const handleThemeSelect = () => {
    showThemeSelector.value = false;
  };

  // 切换开发模式
  const toggleDevMode = () => {
    devModeStore.toggleDevMode();
  };

  // 处理登出
  const handleLogout = async () => {
    if (isLoggingOut.value) return; // 防止重复点击

    try {
      isLoggingOut.value = true;
      showLogoutConfirm.value = false;

      // 显示全局 loading
      showLoading({
        text: 'common.loggingOut',
        type: 'spinner',
        closable: false,
        backdropClosable: false,
      });

      const result = await userStore.logout();
      await new Promise(resolve => setTimeout(resolve, 1000));

      hideLoading();
      await new Promise(resolve => setTimeout(resolve, 500));

      if (result.success) {
        // 登出成功，跳转到登录页
        window.location.href = '/login';
      } else {
        // 登出失败，隐藏 loading 并显示错误信息
        console.error('登出失败:', result.message);
        showFailToast(result.message);
      }
    } catch (error) {
      console.error('登出失败:', error);
      // 即使出现异常，也尝试跳转到登录页
      window.location.href = '/login';
    } finally {
      isLoggingOut.value = false;
    }
  };

  // 跳转到登录页
  const goToLogin = () => {
    router.push('/login');
  };

  // 处理收藏点击
  const handleFavoriteClick = () => {
    if (userStore.isAuthenticated) {
      router.push('/favorite');
    } else {
      goToLogin();
    }
  };
</script>
