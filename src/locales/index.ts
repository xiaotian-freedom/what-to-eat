import { createI18n } from 'vue-i18n';
import zh from './zh-CN';
import en from './en-US';

// 获取浏览器语言设置
const getDefaultLocale = () => {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale) {
    return savedLocale;
  }

  const browserLocale = navigator.language.toLowerCase();
  if (browserLocale.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
};

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zh,
    'en-US': en,
  },
});

export default i18n;
