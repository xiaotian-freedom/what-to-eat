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
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  import HeaderBar from '@/components/HeaderBar.vue';
  import ThemeSelectorBottomSheet from '@/components/ThemeSelectorBottomSheet.vue';
  import LanguageSelectorBottomSheet from '@/components/LanguageSelectorBottomSheet.vue';
  import AboutBottomSheet from '@/components/AboutBottomSheet.vue';
  import ModeSelectionBottomSheet from '@/components/ModeSelectionBottomSheet.vue';
  import { useDevModeStore } from '@/stores/devMode';
  import { useThemeStore } from '@/stores/theme';
  import { useWheelModeStore } from '@/stores/wheelMode';

  const devModeStore = useDevModeStore();
  const themeStore = useThemeStore();
  const wheelModeStore = useWheelModeStore();

  // 页面加载时加载开发模式状态
  onMounted(() => {
    devModeStore.loadDevModeState();
    wheelModeStore.loadModeSettings();
  });

  // 响应式数据
  const showLanguageSelector = ref(false);
  const showThemeSelector = ref(false);
  const showAboutModal = ref(false);
  const showModeSelector = ref(false);

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
</script>
