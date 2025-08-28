<template>
  <div class="p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('settings.selectionMode') }}</h2>
    <div class="space-y-4">
      <!-- 卡片模式 -->
      <div
        @click="selectMode('card')"
        class="relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer"
        :class="
          selectedMode === 'card'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        "
      >
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :class="
                selectedMode === 'card' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              "
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800">{{ $t('mode.card.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('mode.card.description') }}</p>
          </div>
          <div class="flex-shrink-0">
            <div
              v-if="selectedMode === 'card'"
              class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
            >
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div v-else class="w-6 h-6 rounded-full border-2 border-gray-300"></div>
          </div>
        </div>
      </div>

      <!-- 转盘模式 -->
      <div
        @click="selectMode('wheel')"
        class="relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer"
        :class="
          selectedMode === 'wheel'
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        "
      >
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :class="
                selectedMode === 'wheel'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-600'
              "
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800">{{ $t('mode.wheel.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ $t('mode.wheel.description') }}</p>
          </div>
          <div class="flex-shrink-0">
            <div
              v-if="selectedMode === 'wheel'"
              class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
            >
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div v-else class="w-6 h-6 rounded-full border-2 border-gray-300"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 转盘大小设置 (仅在转盘模式下显示) -->
    <div v-if="selectedMode === 'wheel'" class="mt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('settings.wheelSize') }}</h3>
      <div class="grid grid-cols-3 gap-3">
        <div
          v-for="size in (['small', 'medium', 'large'] as const)"
          :key="size"
          @click="selectWheelSize(size as WheelSize)"
          class="relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer text-center"
          :class="
            selectedWheelSize === size
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          "
        >
          <div class="flex flex-col items-center space-y-2">
            <div
              class="rounded-full border-2 transition-all"
              :class="{
                'w-6 h-6 border-purple-400': size === 'small',
                'w-8 h-8 border-purple-500': size === 'medium',
                'w-10 h-10 border-purple-600': size === 'large',
              }"
            ></div>
            <span
              class="text-sm font-medium"
              :class="selectedWheelSize === size ? 'text-purple-600' : 'text-gray-600'"
            >
              {{ $t(`settings.wheelSizeOptions.${size}`) }}
            </span>
          </div>
          <!-- 选中标识 -->
          <div
            v-if="selectedWheelSize === size"
            class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
          >
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-8 flex space-x-3">
      <button
        @click="$emit('close')"
        class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
      >
        {{ $t('common.cancel') }}
      </button>
      <button
        @click="confirmSelection"
        class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
      >
        {{ $t('common.confirm') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useWheelModeStore, type SelectionMode, type WheelSize } from '@/stores/wheelMode';
  import { showSuccessToast } from 'vant';
  import { useI18n } from 'vue-i18n';

  interface Emits {
    (e: 'close'): void;
  }

  const emit = defineEmits<Emits>();
  const wheelModeStore = useWheelModeStore();
  const { t } = useI18n();

  const selectedMode = ref<SelectionMode>(wheelModeStore.currentMode);
  const selectedWheelSize = ref<WheelSize>(wheelModeStore.wheelSize);

  // 选择模式
  const selectMode = (mode: SelectionMode) => {
    selectedMode.value = mode;
  };

  // 选择转盘大小
  const selectWheelSize = (size: WheelSize) => {
    selectedWheelSize.value = size;
  };

  // 确认选择
  const confirmSelection = () => {
    wheelModeStore.setMode(selectedMode.value);
    if (selectedMode.value === 'wheel') {
      wheelModeStore.setWheelSize(selectedWheelSize.value);
    }
    showSuccessToast(t('messages.modeChanged'));
    emit('close');
  };
</script>

<style scoped>
  /* 组件特定样式 */
</style>
