<template>
  <BottomSheet
    :visible="visible"
    @close="$emit('close')"
    :closeOnBackdrop="true"
    maxHeight="85vh"
    :title="$t('settings.language')"
  >
    <div class="space-y-4">
      <!-- 中文 -->
      <div
        @click="selectLanguage('zh-CN')"
        class="relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer"
        :class="selectedLanguage === 'zh-CN' ? 'theme-border-primary' : 'hover:border-gray-300'"
        :style="{
          backgroundColor:
            selectedLanguage === 'zh-CN'
              ? 'var(--color-primary-light, rgba(99, 102, 241, 0.1))'
              : 'var(--color-surface)',
          borderColor:
            selectedLanguage === 'zh-CN' ? 'var(--color-primary)' : 'var(--color-border)',
        }"
      >
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
              :style="{
                backgroundColor:
                  selectedLanguage === 'zh-CN'
                    ? 'var(--color-primary-light, rgba(99, 102, 241, 0.15))'
                    : 'var(--color-border)',
                color:
                  selectedLanguage === 'zh-CN'
                    ? 'var(--color-primary)'
                    : 'var(--color-textSecondary)',
              }"
            >
              <span class="text-2xl">🇨🇳</span>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold" style="color: var(--color-text)">简体中文</h3>
            <p class="text-sm mt-1" style="color: var(--color-textSecondary)">中文</p>
          </div>
          <div class="flex-shrink-0">
            <div
              v-if="selectedLanguage === 'zh-CN'"
              class="w-6 h-6 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: 'var(--color-primary)' }"
            >
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div
              v-else
              class="w-6 h-6 rounded-full border-2"
              :style="{ borderColor: 'var(--color-border)' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 英文 -->
      <div
        @click="selectLanguage('en-US')"
        class="relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer"
        :class="selectedLanguage === 'en-US' ? 'theme-border-secondary' : 'hover:border-gray-300'"
        :style="{
          backgroundColor:
            selectedLanguage === 'en-US'
              ? 'var(--color-secondary-light, rgba(139, 92, 246, 0.1))'
              : 'var(--color-surface)',
          borderColor:
            selectedLanguage === 'en-US' ? 'var(--color-secondary)' : 'var(--color-border)',
        }"
      >
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
              :style="{
                backgroundColor:
                  selectedLanguage === 'en-US'
                    ? 'var(--color-secondary-light, rgba(139, 92, 246, 0.15))'
                    : 'var(--color-border)',
                color:
                  selectedLanguage === 'en-US'
                    ? 'var(--color-secondary)'
                    : 'var(--color-textSecondary)',
              }"
            >
              <span class="text-2xl">🇺🇸</span>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold" style="color: var(--color-text)">English</h3>
            <p class="text-sm mt-1" style="color: var(--color-textSecondary)">English</p>
          </div>
          <div class="flex-shrink-0">
            <div
              v-if="selectedLanguage === 'en-US'"
              class="w-6 h-6 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: 'var(--color-secondary)' }"
            >
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div
              v-else
              class="w-6 h-6 rounded-full border-2"
              :style="{ borderColor: 'var(--color-border)' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-8">
      <button
        @click="confirmSelection"
        class="w-full px-6 py-3 rounded-lg font-medium transition-all text-white"
        :style="{
          background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
        }"
      >
        {{ $t('common.confirm') }}
      </button>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { showSuccessToast } from 'vant';
  import BottomSheet from './BottomSheet.vue';

  interface Props {
    visible: boolean;
  }

  interface Emits {
    (e: 'close'): void;
    (e: 'select', language: string): void;
  }

  defineProps<Props>();

  const emit = defineEmits<Emits>();
  const { locale, t } = useI18n();

  const selectedLanguage = ref<string>(locale.value);

  // 选择语言
  const selectLanguage = (language: string) => {
    selectedLanguage.value = language;
  };

  // 确认选择
  const confirmSelection = () => {
    // 更新语言设置
    locale.value = selectedLanguage.value;
    localStorage.setItem('locale', selectedLanguage.value);

    showSuccessToast(t('messages.languageChanged'));
    emit('select', selectedLanguage.value);
    emit('close');
  };
</script>

<style scoped>
  /* 组件特定样式 */
</style>
