<template>
  <div v-if="showGuide" class="fixed inset-0 z-50 pointer-events-none">
    <!-- 遮罩层 -->
    <div class="absolute inset-0"></div>

    <!-- 气泡引导 -->
    <div v-if="currentStep < steps.length" class="absolute z-10 bubble-guide" :style="bubbleStyle">
      <!-- 气泡内容 -->
      <div class="relative">
        <!-- 气泡主体 -->
        <div class="bg-white rounded-2xl shadow-lg py-5 px-4 w-60 h-[150px] bubble-content">
          <!-- 引导文本 -->
          <div class="text-center">
            <h4 class="text-sm font-semibold text-gray-800 mb-1">
              {{ $t(`bubbleGuide.step${currentStep + 1}.title`) }}
            </h4>
            <p class="text-xs text-gray-600 my-4">
              {{ $t(`bubbleGuide.step${currentStep + 1}.description`) }}
            </p>
          </div>

          <!-- 步骤指示器 -->
          <div class="flex justify-center mb-4">
            <div class="flex space-x-1">
              <div
                v-for="(_, index) in steps"
                :key="index"
                class="w-2 h-2 rounded-full transition-colors"
                :class="index <= currentStep ? 'bg-purple-500' : 'bg-gray-300'"
              ></div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <button
              v-if="currentStep > 0"
              @click="prevStep"
              class="flex-1 py-1.5 px-3 text-xs rounded-lg bg-yellow-500 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors pointer-events-auto"
            >
              {{ $t('common.back') }}
            </button>
            <button
              @click="nextStep"
              class="flex-1 py-1.5 px-3 text-xs rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all pointer-events-auto"
            >
              {{ currentStep === steps.length - 1 ? $t('bubbleGuide.gotIt') : $t('common.next') }}
            </button>
          </div>
        </div>

        <!-- 气泡尾巴 -->
        <div class="absolute w-0 h-0 bubble-tail" :style="tailStyle"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  useI18n();

  const props = defineProps<{
    showGuide: boolean;
    targetElements?: {
      addButton?: HTMLElement | null;
      randomButton?: HTMLElement | null;
      listButton?: HTMLElement | null;
      menuButton?: HTMLElement | null;
    };
  }>();

  const emit = defineEmits<{
    (e: 'complete'): void;
    (e: 'skip'): void;
  }>();

  // 引导步骤配置
  const steps = [
    { target: 'addButton', position: 'top' },
    { target: 'randomButton', position: 'top' },
    { target: 'listButton', position: 'top' },
    { target: 'menuButton', position: 'bottom' },
  ];

  const currentStep = ref(0);
  const bubbleStyle = ref({});
  const tailStyle = ref({});

  // 计算气泡位置
  const calculateBubblePosition = () => {
    const step = steps[currentStep.value];
    const targetElement = props.targetElements?.[step.target as keyof typeof props.targetElements];

    if (!targetElement) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }

    const rect = targetElement.getBoundingClientRect();
    const bubbleWidth = 240; // 气泡宽度
    const bubbleHeight = 150; // 气泡高度（包含padding和内容）
    const offset = 150; // 偏移距离

    let left = 0;
    let top = 0;

    switch (step.position) {
      case 'bottom':
        // 气泡在按钮下方
        left = rect.left + rect.width / 2 - bubbleWidth / 2;
        top = rect.bottom - bubbleHeight + 60;
        break;
      case 'top':
        // 气泡在按钮上方
        left = rect.left + rect.width / 2 - bubbleWidth / 2;
        top = rect.top - bubbleHeight - offset;
        break;
      case 'left':
        // 气泡在按钮左侧
        left = rect.left - bubbleWidth - offset;
        top = rect.top + rect.height / 2 - bubbleHeight / 2;
        break;
      case 'right':
        // 气泡在按钮右侧
        left = rect.right + offset;
        top = rect.top + rect.height / 2 - bubbleHeight / 2;
        break;
    }

    // 边界检查 - 确保气泡完全可见
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 16; // 边距

    // 水平边界检查
    if (left < margin) {
      left = margin;
    }
    if (left + bubbleWidth > viewportWidth - margin) {
      left = viewportWidth - bubbleWidth - margin;
    }

    // 垂直边界检查
    if (top < margin) {
      top = margin;
    }
    if (top + bubbleHeight > viewportHeight - margin) {
      top = viewportHeight - bubbleHeight - margin;
    }

    // 确保位置不为负数
    left = Math.max(0, left);
    top = Math.max(0, top);

    return {
      left: `${left}px`,
      top: `${top}px`,
      transform: 'translateX(0)',
    };
  };

  // 计算气泡尾巴位置
  const calculateTailPosition = () => {
    const step = steps[currentStep.value];
    const targetElement = props.targetElements?.[step.target as keyof typeof props.targetElements];

    if (!step || !targetElement) {
      return { display: 'none' };
    }

    // 计算目标按钮相对于气泡的位置
    const rect = targetElement.getBoundingClientRect();
    const bubbleStyleValue = bubbleStyle.value as { left?: string; top?: string };
    const bubbleLeft = parseInt(bubbleStyleValue.left || '0') || 0;
    const bubbleTop = parseInt(bubbleStyleValue.top || '0') || 0;
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    let tailStyle = {};

    // 计算尾巴在气泡边缘的精确位置，直接指向目标按钮中心
    // 计算目标按钮中心相对于气泡边缘的位置
    let tailXPercent, tailYPercent;

    if (step.position === 'top' || step.position === 'bottom') {
      // 水平方向的尾巴，需要计算X位置
      // 计算目标按钮中心相对于气泡边缘的百分比位置
      // 考虑尾巴的宽度（8px），确保尾巴中心对准目标按钮中心
      const tailWidth = 16; // 尾巴宽度的一半
      const adjustedTargetX = targetCenterX - bubbleLeft;
      const rawXPercent = (adjustedTargetX / 240) * 100;

      // 微调：补偿CSS渲染和三角形形状的误差
      // 尾巴偏右一个尾巴宽度，需要向左调整
      const fineTuneOffset = -(tailWidth / 240) * 100; // 向左调整一个尾巴宽度的百分比
      const adjustedXPercent = rawXPercent + fineTuneOffset;

      tailXPercent = Math.max(15, Math.min(85, adjustedXPercent));
    } else {
      // 垂直方向的尾巴，需要计算Y位置
      const rawYPercent = ((targetCenterY - bubbleTop) / 150) * 100;
      tailYPercent = Math.max(15, Math.min(85, rawYPercent));

      console.log('🎯 垂直方向尾巴计算:', {
        targetCenterY,
        bubbleTop,
        bubbleHeight: 150,
        rawYPercent: rawYPercent.toFixed(2),
        finalYPercent: tailYPercent.toFixed(2),
        shouldPointTo: '目标按钮中心Y位置',
      });
    }

    switch (step.position) {
      case 'bottom':
        // 气泡在按钮下方，尾巴指向上方
        tailStyle = {
          top: '-8px',
          left: `${tailXPercent}%`,
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid white',
          borderTop: 'none',
          display: 'block',
          visibility: 'visible',
          opacity: '1',
        };
        break;
      case 'top':
        // 气泡在按钮上方，尾巴指向下方
        tailStyle = {
          bottom: '-8px',
          left: `${tailXPercent}%`,
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
          borderBottom: 'none',
          display: 'block',
          visibility: 'visible',
          opacity: '1',
        };
        break;
      case 'left':
        // 气泡在按钮左侧，尾巴指向右方
        tailStyle = {
          right: '-8px',
          top: `${tailYPercent}%`,
          transform: 'translateY(-50%)',
          width: '0',
          height: '0',
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: '8px solid white',
          borderLeft: 'none',
          display: 'block',
          visibility: 'visible',
          opacity: '1',
        };
        break;
      case 'right':
        // 气泡在按钮右侧，尾巴指向左方
        tailStyle = {
          left: '-8px',
          top: `${tailYPercent}%`,
          transform: 'translateY(-50%)',
          width: '0',
          height: '0',
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: '8px solid white',
          borderRight: 'none',
          display: 'block',
          visibility: 'visible',
          opacity: '1',
        };
        break;
    }

    return tailStyle;
  };

  // 初始化引导位置（更可靠的初始化方法）
  const initializeGuidePosition = async () => {
    console.log('🎯 开始初始化引导位置...');

    // 首先检查目标元素是否可用
    const step = steps[currentStep.value];
    const targetElement = props.targetElements?.[step.target as keyof typeof props.targetElements];

    if (!targetElement) {
      console.warn('⚠️ 目标元素不存在，等待元素准备...');
      // 如果目标元素不存在，等待一段时间后重试
      setTimeout(() => {
        initializeGuidePosition();
      }, 300);
      return;
    }

    // 检查元素是否有有效的尺寸和位置
    const rect = targetElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn('⚠️ 目标元素尺寸为0，等待元素渲染...');
      setTimeout(() => {
        initializeGuidePosition();
      }, 200);
      return;
    }

    console.log('✅ 目标元素已准备好，开始计算位置:', {
      element: step.target,
      rect: rect,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });

    // 元素准备好后，更新位置
    await updateBubblePosition();
  };

  // 更新气泡位置
  const updateBubblePosition = async () => {
    await nextTick();

    // 添加延迟确保DOM完全渲染
    await new Promise(resolve => setTimeout(resolve, 100));

    const position = calculateBubblePosition();
    bubbleStyle.value = position;

    // 等待下一个tick确保bubbleStyle已更新
    await nextTick();
    tailStyle.value = calculateTailPosition();

    // 验证位置是否正确，如果不正确则重试
    await validateAndRetryPosition();

    // 详细调试信息
    const step = steps[currentStep.value];
    const targetElement = props.targetElements?.[step.target as keyof typeof props.targetElements];
    if (targetElement) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 检查是否超出边界
      const bubbleLeft = parseInt(position.left as string) || 0;
      const bubbleTop = parseInt(position.top as string) || 0;

      if (
        bubbleLeft < 0 ||
        bubbleTop < 0 ||
        bubbleLeft + 240 > viewportWidth ||
        bubbleTop + 150 > viewportHeight
      ) {
        console.warn('⚠️ 气泡可能超出屏幕边界！');
      }
    }
  };

  // 下一步
  const nextStep = () => {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++;
      updateBubblePosition();
    } else {
      // 引导完成
      emit('complete');
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
      updateBubblePosition();
    }
  };

  // 跳过引导（暂时不使用，但保留以备将来使用）
  // const skipGuide = () => {
  //   emit('skip');
  // };

  // 监听步骤变化
  watch(currentStep, () => {
    updateBubblePosition();
  });

  // 监听目标元素变化
  watch(
    () => props.targetElements,
    () => {
      updateBubblePosition();
    },
    { deep: true }
  );

  // 组件挂载时初始化位置
  onMounted(() => {
    // 等待更长时间确保所有组件和数据都加载完成
    setTimeout(() => {
      initializeGuidePosition();
    }, 500);

    // 监听窗口大小变化，重新计算位置
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);
  });

  // 组件卸载时清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleWindowResize);
    window.removeEventListener('orientationchange', handleWindowResize);
  });

  // 防抖定时器
  let resizeTimeout: number | null = null;

  // 处理窗口大小变化
  const handleWindowResize = () => {
    // 防抖处理，避免频繁重新计算
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      updateBubblePosition();
    }, 300);
  };

  // 手动调整气泡位置（用于调试）
  const adjustBubblePosition = (adjustments: { left?: number; top?: number }) => {
    const currentStyle = bubbleStyle.value as { left?: string; top?: string; transform?: string };
    const currentLeft = parseInt(currentStyle.left || '0') || 0;
    const currentTop = parseInt(currentStyle.top || '0') || 0;

    bubbleStyle.value = {
      ...currentStyle,
      left: `${currentLeft + (adjustments.left || 0)}px`,
      top: `${currentTop + (adjustments.top || 0)}px`,
    };
  };

  // 验证位置是否正确，如果不正确则重试
  const validateAndRetryPosition = async (retryCount = 0) => {
    const maxRetries = 5; // 增加重试次数
    const step = steps[currentStep.value];
    const targetElement = props.targetElements?.[step.target as keyof typeof props.targetElements];

    if (!targetElement) {
      console.warn('⚠️ 目标元素不存在，跳过位置验证');
      return;
    }

    // 重新获取目标元素的位置信息，确保是最新的
    const rect = targetElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn('⚠️ 目标元素尺寸为0，等待元素渲染...');
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 300));
        await validateAndRetryPosition(retryCount + 1);
      }
      return;
    }

    const currentStyle = bubbleStyle.value as { left?: string; top?: string };
    const bubbleLeft = parseInt(currentStyle.left || '0') || 0;
    const bubbleTop = parseInt(currentStyle.top || '0') || 0;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 检查位置是否合理（更宽松的边界检查）
    const margin = 20; // 增加边距
    const isPositionValid =
      bubbleLeft >= -margin &&
      bubbleTop >= -margin &&
      bubbleLeft + 240 <= viewportWidth + margin &&
      bubbleTop + 150 <= viewportHeight + margin;

    if (!isPositionValid && retryCount < maxRetries) {
      console.warn(`⚠️ 气泡位置异常，第${retryCount + 1}次重试:`, {
        position: { left: bubbleLeft, top: bubbleTop },
        viewport: { width: viewportWidth, height: viewportHeight },
        targetRect: rect,
        isValid: isPositionValid,
      });

      // 等待更长时间后重试
      await new Promise(resolve => setTimeout(resolve, 300 * (retryCount + 1)));

      // 重新计算位置
      const newPosition = calculateBubblePosition();
      bubbleStyle.value = newPosition;

      await nextTick();
      tailStyle.value = calculateTailPosition();

      // 递归重试
      await validateAndRetryPosition(retryCount + 1);
    } else if (!isPositionValid) {
      console.error('🚨 多次重试后位置仍然异常，使用紧急修复');
      emergencyFixPosition();
    } else {
      console.log('✅ 气泡位置验证通过:', {
        position: { left: bubbleLeft, top: bubbleTop },
        viewport: { width: viewportWidth, height: viewportHeight },
        targetRect: rect,
      });
    }
  };

  // 紧急修复位置（如果气泡跑到屏幕外）
  const emergencyFixPosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 将气泡放在屏幕中央
    bubbleStyle.value = {
      left: `${(viewportWidth - 240) / 2}px`,
      top: `${(viewportHeight - 120) / 2}px`,
      transform: 'translateX(0)',
    };

    console.log('🚨 紧急修复：气泡位置已重置到屏幕中央');
  };

  // 暴露方法给父组件
  defineExpose({
    nextStep,
    prevStep,
    updateBubblePosition,
    adjustBubblePosition,
    emergencyFixPosition,
  });
</script>

<style scoped>
  /* 气泡引导动画样式 */

  /* 气泡浮动动画 */
  @keyframes bubbleFloat {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  /* 气泡进入动画 */
  @keyframes bubbleEnter {
    0% {
      opacity: 0;
      transform: scale(0.8) translateY(20px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* 气泡退出动画 */
  @keyframes bubbleExit {
    0% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    100% {
      opacity: 0;
      transform: scale(0.8) translateY(-20px);
    }
  }

  /* 气泡主体样式 */
  .bubble-guide {
    animation: bubbleFloat 3s ease-in-out infinite, bubbleEnter 0.5s ease-out;
  }

  .bubble-content {
    position: relative;
    z-index: 1;
  }

  /* 气泡尾巴样式 */
  .bubble-tail {
    position: absolute;
    z-index: 10;
    pointer-events: none;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* 按钮高亮效果 */
  .bubble-guide .pointer-events-auto {
    transition: all 0.2s ease;
  }

  .bubble-guide .pointer-events-auto:hover {
    transform: translateY(-1px);
  }

  /* 响应式设计 */
  @media (max-width: 640px) {
    .bubble-content {
      max-width: 260px;
      padding: 12px;
    }

    .bubble-guide h4 {
      font-size: 13px;
    }

    .bubble-guide p {
      font-size: 11px;
    }
  }

  /* 深色主题适配 */
  @media (prefers-color-scheme: dark) {
    .bubble-content {
      background-color: rgba(31, 41, 55, 0.95);
      color: #f9fafb;
    }

    .bubble-content h4 {
      color: #e5e7eb;
    }

    .bubble-content p {
      color: #d1d5db;
    }

    .bubble-tail {
      border-color: transparent !important;
    }

    /* 深色主题下的尾巴颜色 */
    .bubble-tail[style*='borderTop'] {
      border-top-color: rgba(31, 41, 55, 0.95) !important;
    }

    .bubble-tail[style*='borderBottom'] {
      border-bottom-color: rgba(31, 41, 55, 0.95) !important;
    }

    .bubble-tail[style*='borderLeft'] {
      border-left-color: rgba(31, 41, 55, 0.95) !important;
    }

    .bubble-tail[style*='borderRight'] {
      border-right-color: rgba(31, 41, 55, 0.95) !important;
    }
  }

  /* 减少动画模式 */
  @media (prefers-reduced-motion: reduce) {
    .bubble-guide {
      animation: none;
    }

    .bubble-guide .pointer-events-auto:hover {
      transform: none;
    }
  }
</style>
