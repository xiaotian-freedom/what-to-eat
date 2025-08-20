import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { APP_CONFIG } from '@/config/app';

export const useDevModeStore = defineStore('devMode', () => {
  // 开发模式状态
  const isDevModeEnabled = ref<boolean>(APP_CONFIG.devMode.enabled);

  // 计算属性：是否启用无限使用
  const isUnlimitedUsesEnabled = computed(
    () => isDevModeEnabled.value && APP_CONFIG.devMode.unlimitedUses
  );

  // 切换开发模式
  const toggleDevMode = (): void => {
    isDevModeEnabled.value = !isDevModeEnabled.value;
    saveDevModeState();
  };

  // 设置开发模式状态
  const setDevMode = (enabled: boolean): void => {
    isDevModeEnabled.value = enabled;
    saveDevModeState();
  };

  // 从localStorage加载开发模式状态
  const loadDevModeState = (): void => {
    try {
      const stored = localStorage.getItem('devModeEnabled');
      if (stored !== null) {
        isDevModeEnabled.value = JSON.parse(stored);
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

  return {
    isDevModeEnabled,
    isUnlimitedUsesEnabled,
    toggleDevMode,
    setDevMode,
    loadDevModeState,
  };
});
