<template>
  <div class="language-switcher">
    <button
      @click="toggleLanguage"
      class="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium transition-all duration-200 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
    >
      <span class="text-lg">{{ currentLanguageFlag }}</span>
      <span class="text-gray-700">{{ currentLanguageName }}</span>
      <svg
        class="w-4 h-4 text-gray-600 transition-transform duration-200"
        :class="{ 'rotate-180': showDropdown }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 下拉菜单 -->
    <div
      v-if="showDropdown"
      class="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
    >
      <button
        @click="switchLanguage('zh-CN')"
        class="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
        :class="{ 'bg-purple-50 text-purple-600': currentLocale === 'zh-CN' }"
      >
        <span class="text-lg">🇨🇳</span>
        <span>中文</span>
      </button>
      <button
        @click="switchLanguage('en-US')"
        class="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
        :class="{ 'bg-purple-50 text-purple-600': currentLocale === 'en-US' }"
      >
        <span class="text-lg">🇺🇸</span>
        <span>English</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { locale } = useI18n();

  const showDropdown = ref(false);
  const currentLocale = computed(() => locale.value);

  const currentLanguageFlag = computed(() => {
    return currentLocale.value === 'zh-CN' ? '🇨🇳' : '🇺🇸';
  });

  const currentLanguageName = computed(() => {
    return currentLocale.value === 'zh-CN' ? '中文' : 'English';
  });

  const toggleLanguage = () => {
    showDropdown.value = !showDropdown.value;
  };

  const switchLanguage = (lang: string) => {
    locale.value = lang;
    localStorage.setItem('locale', lang);
    showDropdown.value = false;
  };

  // 点击外部关闭下拉菜单
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element;
    if (!target.closest('.language-switcher')) {
      showDropdown.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<style scoped>
  .language-switcher {
    position: relative;
  }
</style>
