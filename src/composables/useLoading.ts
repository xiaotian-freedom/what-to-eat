import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Loading 状态接口
export interface LoadingState {
  visible: boolean;
  text: string;
  type: 'spinner' | 'pulse' | 'wave' | 'dots';
  progress?: number;
  showProgress: boolean;
  showProgressText: boolean;
  progressText?: string;
  closable: boolean;
  backdropClosable: boolean;
  // 自定义颜色
  spinnerColor?: string;
  textColor?: string;
  modalBackgroundColor?: string;
  backdropColor?: string;
  borderColor?: string;
  shadowColor?: string;
  progressColor?: string;
  progressBackgroundColor?: string;
  textSecondaryColor?: string;
}

// Loading 配置接口
export interface LoadingConfig {
  text?: string;
  type?: 'spinner' | 'pulse' | 'wave' | 'dots';
  closable?: boolean;
  backdropClosable?: boolean;
  // 自定义颜色
  spinnerColor?: string;
  textColor?: string;
  modalBackgroundColor?: string;
  backdropColor?: string;
  borderColor?: string;
  shadowColor?: string;
  progressColor?: string;
  progressBackgroundColor?: string;
  textSecondaryColor?: string;
}

// 全局 Loading 状态
const globalLoadingState = reactive<LoadingState>({
  visible: false,
  text: '',
  type: 'spinner',
  showProgress: false,
  showProgressText: true,
  closable: false,
  backdropClosable: false,
});

// 预设的 Loading 配置
const loadingPresets = {
  // 默认加载
  default: {
    text: 'loading.default',
    type: 'spinner' as const,
  },
  // 数据加载中
  data: {
    text: 'loading.data',
    type: 'spinner' as const,
  },
  // 上传中
  upload: {
    text: 'loading.upload',
    type: 'pulse' as const,
  },
  // 处理中
  processing: {
    text: 'loading.processing',
    type: 'wave' as const,
  },
  // 保存中
  saving: {
    text: 'loading.saving',
    type: 'dots' as const,
  },
  // 网络请求中
  network: {
    text: 'loading.network',
    type: 'spinner' as const,
  },
  // 分析中
  analyzing: {
    text: 'loading.analyzing',
    type: 'wave' as const,
  },
  // 推荐中
  recommending: {
    text: 'loading.recommending',
    type: 'pulse' as const,
  },
};

/**
 * 全局 Loading Hook
 * 提供统一的 loading 状态管理
 */
export function useLoading() {
  const { t } = useI18n();

  // 显示 Loading
  const show = (config: LoadingConfig | string = {}) => {
    let finalConfig: LoadingConfig;

    if (typeof config === 'string') {
      // 如果是字符串，使用预设配置
      const preset = loadingPresets[config as keyof typeof loadingPresets];
      if (preset) {
        finalConfig = { ...preset };
      } else {
        // 如果不是预设，直接作为文本使用
        finalConfig = { text: config };
      }
    } else {
      finalConfig = config;
    }

    // 应用配置
    Object.assign(globalLoadingState, {
      visible: true,
      text: finalConfig.text ? t(finalConfig.text) : '',
      type: finalConfig.type || 'spinner',
      showProgress: false,
      showProgressText: true,
      closable: finalConfig.closable || false,
      backdropClosable: finalConfig.backdropClosable || false,
      // 自定义颜色
      spinnerColor: finalConfig.spinnerColor,
      textColor: finalConfig.textColor,
      modalBackgroundColor: finalConfig.modalBackgroundColor,
      backdropColor: finalConfig.backdropColor,
      borderColor: finalConfig.borderColor,
      shadowColor: finalConfig.shadowColor,
      progressColor: finalConfig.progressColor,
      progressBackgroundColor: finalConfig.progressBackgroundColor,
      textSecondaryColor: finalConfig.textSecondaryColor,
    });
  };

  // 隐藏 Loading
  const hide = () => {
    globalLoadingState.visible = false;
  };

  // 更新 Loading 文本
  const updateText = (text: string) => {
    globalLoadingState.text = t(text);
  };

  // 显示带进度的 Loading
  const showWithProgress = (config: LoadingConfig | string = {}, initialProgress: number = 0) => {
    show(config);
    globalLoadingState.showProgress = true;
    globalLoadingState.progress = initialProgress;
  };

  // 更新进度
  const updateProgress = (progress: number, text?: string) => {
    globalLoadingState.progress = Math.min(100, Math.max(0, progress));
    if (text) {
      globalLoadingState.progressText = t(text);
    }
  };

  // 完成进度
  const completeProgress = (text?: string) => {
    globalLoadingState.progress = 100;
    if (text) {
      globalLoadingState.progressText = t(text);
    }
    // 延迟隐藏，让用户看到完成状态
    setTimeout(() => {
      hide();
    }, 500);
  };

  // 关闭 Loading（用户主动关闭）
  const close = () => {
    hide();
  };

  // 计算属性
  const isLoading = computed(() => globalLoadingState.visible);
  const loadingText = computed(() => globalLoadingState.text);
  const loadingType = computed(() => globalLoadingState.type);
  const loadingProgress = computed(() => globalLoadingState.progress);

  return {
    // 状态
    loadingState: globalLoadingState,
    isLoading,
    loadingText,
    loadingType,
    loadingProgress,

    // 方法
    show,
    hide,
    updateText,
    showWithProgress,
    updateProgress,
    completeProgress,
    close,

    // 预设方法
    showDefault: () => show('default'),
    showData: () => show('data'),
    showUpload: () => show('upload'),
    showProcessing: () => show('processing'),
    showSaving: () => show('saving'),
    showNetwork: () => show('network'),
    showAnalyzing: () => show('analyzing'),
    showRecommending: () => show('recommending'),
  };
}

/**
 * 局部 Loading Hook
 * 用于组件内部的 loading 状态管理
 */
export function useLocalLoading(initialConfig: LoadingConfig = {}) {
  const { t } = useI18n();

  const localState = reactive<LoadingState>({
    visible: false,
    text: '',
    type: 'spinner',
    showProgress: false,
    showProgressText: true,
    closable: false,
    backdropClosable: false,
    ...initialConfig,
  });

  const show = (config: LoadingConfig | string = {}) => {
    let finalConfig: LoadingConfig;

    if (typeof config === 'string') {
      const preset = loadingPresets[config as keyof typeof loadingPresets];
      if (preset) {
        finalConfig = { ...preset };
      } else {
        finalConfig = { text: config };
      }
    } else {
      finalConfig = config;
    }

    Object.assign(localState, {
      visible: true,
      text: finalConfig.text ? t(finalConfig.text) : '',
      type: finalConfig.type || 'spinner',
      showProgress: false,
      showProgressText: true,
      closable: finalConfig.closable || false,
      backdropClosable: finalConfig.backdropClosable || false,
      ...finalConfig,
    });
  };

  const hide = () => {
    localState.visible = false;
  };

  const updateText = (text: string) => {
    localState.text = t(text);
  };

  const showWithProgress = (config: LoadingConfig | string = {}, initialProgress: number = 0) => {
    show(config);
    localState.showProgress = true;
    localState.progress = initialProgress;
  };

  const updateProgress = (progress: number, text?: string) => {
    localState.progress = Math.min(100, Math.max(0, progress));
    if (text) {
      localState.progressText = t(text);
    }
  };

  const completeProgress = (text?: string) => {
    localState.progress = 100;
    if (text) {
      localState.progressText = t(text);
    }
    setTimeout(() => {
      hide();
    }, 500);
  };

  const close = () => {
    hide();
  };

  const isLoading = computed(() => localState.visible);
  const loadingText = computed(() => localState.text);
  const loadingType = computed(() => localState.type);
  const loadingProgress = computed(() => localState.progress);

  return {
    loadingState: localState,
    isLoading,
    loadingText,
    loadingType,
    loadingProgress,
    show,
    hide,
    updateText,
    showWithProgress,
    updateProgress,
    completeProgress,
    close,
  };
}

// 导出预设配置
export { loadingPresets };
