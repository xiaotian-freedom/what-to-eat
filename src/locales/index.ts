import { createI18n } from 'vue-i18n';
import zh from './zh-CN';
import en from './en-US';

// 支持的语言类型
export type SupportedLocale = 'zh-CN' | 'en-US';

// 语言配置
export const LANGUAGE_CONFIG: Record<SupportedLocale, { name: string }> = {
  'zh-CN': { name: '简体中文' },
  'en-US': { name: 'English' },
};

// 获取浏览器语言设置
const getDefaultLocale = (): SupportedLocale => {
  const savedLocale = localStorage.getItem('locale') as SupportedLocale;
  if (savedLocale && savedLocale in LANGUAGE_CONFIG) {
    return savedLocale;
  }

  const browserLocale = navigator.language.toLowerCase();
  if (browserLocale.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
};

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  globalInjection: true, // 允许全局注入
  silentTranslationWarn: true, // 静默翻译警告
  messages: {
    'zh-CN': zh,
    'en-US': en,
  },
});

// 创建中文到 key 的映射（自动生成）
export const zhToKeyMap = new Map<string, string>();
Object.entries(zh).forEach(([key, value]) => {
  if (typeof value === 'string') {
    zhToKeyMap.set(value, key);
  }
});

// 创建翻译工具对象
export const trans = {
  // 标准翻译函数
  t: (key: string, params?: Record<string, any>) => {
    return params ? (i18n.global.t(key, params) as string) : (i18n.global.t(key) as string);
  },

  // 通过中文查找翻译
  findByZh: (zhText: string, params?: Record<string, any>) => {
    const key = zhToKeyMap.get(zhText);
    if (key) {
      return params ? (i18n.global.t(key, params) as string) : (i18n.global.t(key) as string);
    }
    return zhText;
  },

  // 获取当前语言
  getLocale: (): SupportedLocale => i18n.global.locale.value as SupportedLocale,

  // 设置语言
  setLocale: (locale: SupportedLocale) => {
    if (locale in LANGUAGE_CONFIG) {
      i18n.global.locale.value = locale;
      localStorage.setItem('locale', locale);
    }
  },

  // 获取可用语言列表
  getAvailableLocales: () => Object.keys(LANGUAGE_CONFIG) as SupportedLocale[],

  // 获取语言显示名称
  getLocaleName: (locale: SupportedLocale) => LANGUAGE_CONFIG[locale]?.name || locale,
};

// 创建自定义$t函数，支持中文key自动查找
export const $t = (input: string, params?: Record<string, any>): string => {
  // 如果input包含点号，认为是标准key
  if (input.includes('.')) {
    return trans.t(input, params);
  }

  // 否则认为是中文，尝试查找映射
  return trans.findByZh(input, params);
};

// 导出原始i18n实例，用于Vue插件安装
export default i18n;
