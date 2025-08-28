<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors theme-transition"
      :style="{
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      }"
    >
      <span :style="{ color: 'var(--color-textSecondary)' }">{{ currentLanguageName }}</span>
      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        :style="{ color: 'var(--color-textSecondary)' }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 theme-transition"
      :style="{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 10px 15px -3px var(--color-shadow)',
      }"
    >
      <button
        v-for="locale in availableLocales"
        :key="locale.value"
        @click="selectLanguage(locale.value)"
        class="w-full px-3 py-2 text-left flex items-center space-x-2 transition-colors duration-150 theme-transition"
        :style="{
          color: 'var(--color-text)',
          backgroundColor: currentLocale === locale.value ? 'var(--color-border)' : 'transparent',
        }"
        @mouseenter="handleHover"
        @mouseleave="handleLeave"
      >
        <span class="font-medium">{{ locale.label }}</span>
        <span v-if="currentLocale === locale.value" :style="{ color: 'var(--color-primary)' }"
          >✓</span
        >
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { locale } = useI18n();

  const isOpen = ref(false);
  const currentLocale = computed(() => locale.value);

  const currentLanguageName = computed(() => {
    return currentLocale.value === 'zh-CN' ? '中文' : 'English';
  });

  const availableLocales = computed(() => {
    return [
      { value: 'zh-CN', label: '🇨🇳 中文' },
      { value: 'en-US', label: '🇺🇸 English' },
    ];
  });

  const selectLanguage = (lang: string) => {
    locale.value = lang;
    localStorage.setItem('locale', lang);
    isOpen.value = false;
  };

  const handleHover = () => {
    // No specific hover effect needed here as the button handles its own hover state
  };

  const handleLeave = () => {
    // No specific hover effect needed here as the button handles its own hover state
  };

  // 点击外部关闭下拉菜单
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element;
    if (!target.closest('.relative')) {
      // Changed to .relative to match new template structure
      isOpen.value = false;
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
