import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Theme, ThemeId } from '@/types/theme';

// 预定义主题
const defaultThemes: Record<ThemeId, Theme> = {
  default: {
    id: 'default',
    name: '默认主题',
    description: '清新简约的默认主题',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    gradients: {
      primary: 'from-indigo-100 via-purple-100 to-pink-100',
      secondary: 'from-blue-50 to-indigo-50',
      background: 'from-indigo-100 via-purple-100 to-pink-100',
    },
    icon: '🎨',
  },
  dark: {
    id: 'dark',
    name: '深色主题',
    description: '护眼的深色主题',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
    gradients: {
      primary: 'from-slate-900 via-purple-900 to-slate-900',
      secondary: 'from-slate-800 to-slate-700',
      background: 'from-slate-900 via-purple-900 to-slate-900',
    },
    icon: '🌙',
  },
  sunset: {
    id: 'sunset',
    name: '日落主题',
    description: '温暖的日落色彩',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#fbbf24',
      background: '#fef3c7',
      surface: '#ffffff',
      text: '#92400e',
      textSecondary: '#d97706',
      border: '#fde68a',
      shadow: 'rgba(251, 191, 36, 0.2)',
    },
    gradients: {
      primary: 'from-orange-100 via-pink-100 to-yellow-100',
      secondary: 'from-orange-50 to-pink-50',
      background: 'from-orange-100 via-pink-100 to-yellow-100',
    },
    icon: '🌅',
  },
  ocean: {
    id: 'ocean',
    name: '海洋主题',
    description: '清凉的海洋色调',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#0ea5e9',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      shadow: 'rgba(6, 182, 212, 0.2)',
    },
    gradients: {
      primary: 'from-cyan-100 via-blue-100 to-sky-100',
      secondary: 'from-cyan-50 to-blue-50',
      background: 'from-cyan-100 via-blue-100 to-sky-100',
    },
    icon: '🌊',
  },
  forest: {
    id: 'forest',
    name: '森林主题',
    description: '自然的森林绿色',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
      textSecondary: '#065f46',
      border: '#bbf7d0',
      shadow: 'rgba(5, 150, 105, 0.2)',
    },
    gradients: {
      primary: 'from-green-100 via-emerald-100 to-teal-100',
      secondary: 'from-green-50 to-emerald-50',
      background: 'from-green-100 via-emerald-100 to-teal-100',
    },
    icon: '🌲',
  },
  vintage: {
    id: 'vintage',
    name: '复古主题',
    description: '怀旧的复古风格',
    colors: {
      primary: '#a855f7',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      background: '#fdf4ff',
      surface: '#ffffff',
      text: '#581c87',
      textSecondary: '#7c3aed',
      border: '#e9d5ff',
      shadow: 'rgba(168, 85, 247, 0.2)',
    },
    gradients: {
      primary: 'from-purple-100 via-violet-100 to-fuchsia-100',
      secondary: 'from-purple-50 to-violet-50',
      background: 'from-purple-100 via-violet-100 to-fuchsia-100',
    },
    icon: '🎭',
  },
};

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const currentTheme = ref<ThemeId>('default');
  const themes = ref<Record<ThemeId, Theme>>(defaultThemes);

  // 计算属性
  const currentThemeData = computed(() => themes.value[currentTheme.value]);
  const availableThemes = computed(() => Object.values(themes.value));

  // 方法
  const setTheme = (themeId: ThemeId) => {
    currentTheme.value = themeId;
    localStorage.setItem('theme', themeId);
    applyTheme(themeId);
  };

  const applyTheme = (themeId: ThemeId) => {
    const theme = themes.value[themeId];
    if (!theme) return;

    // 应用CSS变量到根元素
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // 更新body的class
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeId}`);
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') as ThemeId;
    if (savedTheme && themes.value[savedTheme]) {
      currentTheme.value = savedTheme;
    }
    applyTheme(currentTheme.value);
  };

  const resetTheme = () => {
    setTheme('default');
  };

  // 初始化
  loadTheme();

  return {
    currentTheme,
    themes,
    currentThemeData,
    availableThemes,
    setTheme,
    applyTheme,
    loadTheme,
    resetTheme,
  };
});
