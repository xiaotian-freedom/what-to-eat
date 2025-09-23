import { ref, onMounted, onUnmounted, nextTick } from 'vue';

/**
 * 键盘适配 composable
 * 用于处理移动设备键盘弹起时的视口变化
 */
export function useKeyboardAdaptation() {
  const isKeyboardVisible = ref(false);
  const keyboardHeight = ref(0);
  const originalViewportHeight = ref(0);
  const currentViewportHeight = ref(0);

  // 检测键盘是否可见
  const detectKeyboardVisibility = () => {
    if (typeof window === 'undefined') return;

    const currentHeight = window.visualViewport?.height || window.innerHeight;
    const currentWidth = window.visualViewport?.width || window.innerWidth;

    // 如果视口高度减少超过 150px，且宽度没有变化，认为是键盘弹起
    const heightDifference = originalViewportHeight.value - currentHeight;
    const isKeyboard =
      heightDifference > 150 &&
      Math.abs((window.screen.width || window.innerWidth) - currentWidth) < 50;

    isKeyboardVisible.value = isKeyboard;
    keyboardHeight.value = isKeyboard ? heightDifference : 0;
    currentViewportHeight.value = currentHeight;
  };

  // 处理视口变化
  const handleViewportChange = () => {
    detectKeyboardVisibility();
  };

  // 滚动到指定元素
  const scrollToElement = async (element: HTMLElement, offset = 20) => {
    if (!element) return;

    await nextTick();

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const elementBottom = rect.bottom;
    const availableHeight = viewportHeight - keyboardHeight.value;

    // 如果元素被键盘遮挡，滚动到可见区域
    if (elementBottom > availableHeight) {
      const scrollTop = elementBottom - availableHeight + offset;
      window.scrollTo({
        top: window.scrollY + scrollTop,
        behavior: 'smooth',
      });
    }
  };

  // 滚动到输入框
  const scrollToInput = async (inputElement: HTMLElement) => {
    if (!inputElement) return;

    // 延迟一下确保键盘完全弹起
    setTimeout(() => {
      scrollToElement(inputElement, 50);
    }, 300);
  };

  // 调整容器高度以适应键盘
  const adjustContainerHeight = (container: HTMLElement, maxHeight?: string) => {
    if (!container) return;

    if (isKeyboardVisible.value) {
      const availableHeight = currentViewportHeight.value - keyboardHeight.value;
      const adjustedHeight = Math.max(availableHeight * 0.8, 300); // 至少300px高度
      container.style.maxHeight = `${adjustedHeight}px`;
      container.style.height = 'auto';
    } else {
      container.style.maxHeight = maxHeight || '';
      container.style.height = '';
    }
  };

  // 初始化
  const init = () => {
    if (typeof window === 'undefined') return;

    originalViewportHeight.value = window.visualViewport?.height || window.innerHeight;
    currentViewportHeight.value = originalViewportHeight.value;

    // 监听视口变化
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // 降级方案：监听 window resize
      window.addEventListener('resize', handleViewportChange);
    }

    // 监听输入框聚焦事件
    document.addEventListener('focusin', e => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // 延迟检测键盘，给键盘弹起时间
        setTimeout(() => {
          detectKeyboardVisibility();
          if (isKeyboardVisible.value) {
            scrollToInput(target);
          }
        }, 300);
      }
    });

    // 监听输入框失焦事件
    document.addEventListener('focusout', () => {
      // 延迟检测，给键盘收起时间
      setTimeout(() => {
        detectKeyboardVisibility();
      }, 300);
    });
  };

  // 清理
  const cleanup = () => {
    if (typeof window === 'undefined') return;

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleViewportChange);
    } else {
      window.removeEventListener('resize', handleViewportChange);
    }
  };

  // 组件挂载时初始化
  onMounted(() => {
    init();
  });

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup();
  });

  return {
    isKeyboardVisible,
    keyboardHeight,
    originalViewportHeight,
    currentViewportHeight,
    scrollToElement,
    scrollToInput,
    adjustContainerHeight,
    detectKeyboardVisibility,
  };
}

/**
 * 专门用于 BottomSheet 的键盘适配
 */
export function useBottomSheetKeyboardAdaptation() {
  const { isKeyboardVisible, keyboardHeight } = useKeyboardAdaptation();

  const adjustBottomSheetHeight = (bottomSheetElement: HTMLElement, originalMaxHeight: string) => {
    if (!bottomSheetElement) return;

    if (isKeyboardVisible.value) {
      // 键盘弹起时，调整 BottomSheet 高度
      const availableHeight =
        (window.visualViewport?.height || window.innerHeight) - keyboardHeight.value;
      const adjustedHeight = Math.min(availableHeight * 0.9, parseInt(originalMaxHeight) || 400);

      bottomSheetElement.style.maxHeight = `${adjustedHeight}px`;
      bottomSheetElement.style.transform = 'translateY(0)';
      bottomSheetElement.style.bottom = '0';
    } else {
      // 键盘收起时，恢复原始设置
      bottomSheetElement.style.maxHeight = originalMaxHeight;
      bottomSheetElement.style.transform = '';
      bottomSheetElement.style.bottom = '';
    }
  };

  return {
    isKeyboardVisible,
    keyboardHeight,
    adjustBottomSheetHeight,
  };
}
