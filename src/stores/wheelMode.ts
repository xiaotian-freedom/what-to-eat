import { defineStore } from 'pinia';
import { ref } from 'vue';

export type SelectionMode = 'card' | 'wheel';

export const useWheelModeStore = defineStore('wheelMode', () => {
  // 当前选择模式
  const currentMode = ref<SelectionMode>('card');

  // 从localStorage加载模式设置
  const loadModeSettings = (): void => {
    try {
      const storedMode = localStorage.getItem('selectionMode') as SelectionMode;
      if (storedMode && ['card', 'wheel'].includes(storedMode)) {
        currentMode.value = storedMode;
      }
    } catch (error) {
      console.error('加载模式设置出错:', error);
    }
  };

  // 保存模式设置到localStorage
  const saveModeSettings = (): void => {
    try {
      localStorage.setItem('selectionMode', currentMode.value);
    } catch (error) {
      console.error('保存模式设置出错:', error);
    }
  };

  // 切换选择模式
  const setMode = (mode: SelectionMode): void => {
    currentMode.value = mode;
    saveModeSettings();
  };

  // 切换到卡片模式
  const switchToCardMode = (): void => {
    setMode('card');
  };

  // 切换到转盘模式
  const switchToWheelMode = (): void => {
    setMode('wheel');
  };

  // 是否为卡片模式
  const isCardMode = (): boolean => {
    return currentMode.value === 'card';
  };

  // 是否为转盘模式
  const isWheelMode = (): boolean => {
    return currentMode.value === 'wheel';
  };

  // 获取转盘大小对应的像素值（固定为中等大小）
  const getWheelSizeInPixels = (): number => {
    return 300; // 固定为中等大小
  };

  return {
    currentMode,
    loadModeSettings,
    setMode,
    switchToCardMode,
    switchToWheelMode,
    isCardMode,
    isWheelMode,
    getWheelSizeInPixels,
  };
});
