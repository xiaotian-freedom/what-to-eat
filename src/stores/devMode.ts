import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { APP_CONFIG } from '@/config/app';

export const useDevModeStore = defineStore('devMode', () => {
  // 开发模式状态
  const isDevModeEnabled = ref<boolean>(APP_CONFIG.devMode.enabled);

  // 开发模式开关显示状态（默认隐藏，连续点击版本信息10次后显示）
  const isDevModeSwitchVisible = ref<boolean>(false);

  // 计算属性：是否启用无限使用
  const isUnlimitedUsesEnabled = computed(
    () => isDevModeEnabled.value && APP_CONFIG.devMode.unlimitedUses
  );

  // 切换开发模式
  const toggleDevMode = (): void => {
    isDevModeEnabled.value = !isDevModeEnabled.value;

    // 如果关闭开发模式，同时隐藏开发模式开关
    if (!isDevModeEnabled.value) {
      isDevModeSwitchVisible.value = false;
      saveDevModeSwitchVisibility();
    }

    saveDevModeState();
  };

  // 设置开发模式状态
  const setDevMode = (enabled: boolean): void => {
    isDevModeEnabled.value = enabled;
    saveDevModeState();
  };

  // 显示开发模式开关
  const showDevModeSwitch = (): void => {
    isDevModeSwitchVisible.value = true;
    saveDevModeSwitchVisibility();
  };

  // 隐藏开发模式开关
  const hideDevModeSwitch = (): void => {
    isDevModeSwitchVisible.value = false;
    saveDevModeSwitchVisibility();
  };

  // 从localStorage加载开发模式状态
  const loadDevModeState = (): void => {
    try {
      const stored = localStorage.getItem('devModeEnabled');
      if (stored !== null) {
        isDevModeEnabled.value = JSON.parse(stored);
      }

      // 加载开发模式开关显示状态
      const switchVisibilityStored = localStorage.getItem('devModeSwitchVisible');
      if (switchVisibilityStored !== null) {
        isDevModeSwitchVisible.value = JSON.parse(switchVisibilityStored);
      }
    } catch (error) {
      console.error('加载开发模式状态出错:', error);
    }
  };

  // 保存开发模式状态到localStorage
  const saveDevModeState = (): void => {
    try {
      localStorage.setItem('devModeEnabled', JSON.stringify(isDevModeEnabled.value));
    } catch (error) {
      console.error('保存开发模式状态出错:', error);
    }
  };

  // 保存开发模式开关显示状态到localStorage
  const saveDevModeSwitchVisibility = (): void => {
    try {
      localStorage.setItem('devModeSwitchVisible', JSON.stringify(isDevModeSwitchVisible.value));
    } catch (error) {
      console.error('保存开发模式开关显示状态出错:', error);
    }
  };

  return {
    isDevModeEnabled,
    isDevModeSwitchVisible,
    isUnlimitedUsesEnabled,
    toggleDevMode,
    setDevMode,
    showDevModeSwitch,
    hideDevModeSwitch,
    loadDevModeState,
  };
});
