import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Theme, ThemeId } from '@/types/theme';

// 预定义主题
const defaultThemes: Record<ThemeId, Theme> = {
  default: {
    id: 'default',
    name: 'themes.default.name',
    description: 'themes.default.description',
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
    name: 'themes.dark.name',
    description: 'themes.dark.description',
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
    name: 'themes.sunset.name',
    description: 'themes.sunset.description',
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
    name: 'themes.ocean.name',
    description: 'themes.ocean.description',
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
    name: 'themes.forest.name',
    description: 'themes.forest.description',
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
    name: 'themes.vintage.name',
    description: 'themes.vintage.description',
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
  aurora: {
    id: 'aurora',
    name: 'themes.aurora.name',
    description: 'themes.aurora.description',
    colors: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#10b981',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      shadow: 'rgba(139, 92, 246, 0.3)',
    },
    gradients: {
      primary: 'from-purple-600 via-cyan-500 to-emerald-500',
      secondary: 'from-purple-500 to-cyan-400',
      background: 'from-slate-900 via-purple-900 to-slate-900',
    },
    icon: '🌌',
  },
  desert: {
    id: 'desert',
    name: 'themes.desert.name',
    description: 'themes.desert.description',
    colors: {
      primary: '#b45309',
      secondary: '#92400e',
      accent: '#f59e0b',
      background: '#fefce8',
      surface: '#ffffff',
      text: '#78350f',
      textSecondary: '#92400e',
      border: '#fde68a',
      shadow: 'rgba(180, 83, 9, 0.2)',
    },
    gradients: {
      primary: 'from-amber-200 via-yellow-200 to-orange-200',
      secondary: 'from-amber-100 to-yellow-100',
      background: 'from-amber-50 via-yellow-50 to-orange-50',
    },
    icon: '🏜️',
  },
  autumn: {
    id: 'autumn',
    name: 'themes.autumn.name',
    description: 'themes.autumn.description',
    colors: {
      primary: '#991b1b',
      secondary: '#7f1d1d',
      accent: '#dc2626',
      background: '#fef2f2',
      surface: '#ffffff',
      text: '#450a0a',
      textSecondary: '#991b1b',
      border: '#fecaca',
      shadow: 'rgba(153, 27, 27, 0.15)',
    },
    gradients: {
      primary: 'from-red-200 via-rose-200 to-red-300',
      secondary: 'from-red-100 to-rose-100',
      background: 'from-red-50 via-rose-50 to-red-100',
    },
    icon: '🍂',
  },
  monochrome: {
    id: 'monochrome',
    name: 'themes.monochrome.name',
    description: 'themes.monochrome.description',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e9ecef',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    gradients: {
      primary: 'from-gray-100 via-gray-200 to-gray-300',
      secondary: 'from-gray-50 to-gray-100',
      background: 'from-white via-gray-50 to-white',
    },
    icon: '⚫',
  },
  pastel: {
    id: 'pastel',
    name: 'themes.pastel.name',
    description: 'themes.pastel.description',
    colors: {
      primary: '#a78bfa',
      secondary: '#f9a8d4',
      accent: '#86efac',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#6b7280',
      textSecondary: '#9ca3af',
      border: '#f3f4f6',
      shadow: 'rgba(167, 139, 250, 0.15)',
    },
    gradients: {
      primary: 'from-purple-100 via-pink-100 to-green-100',
      secondary: 'from-purple-50 to-pink-50',
      background: 'from-purple-100 via-pink-100 to-green-100',
    },
    icon: '🎀',
  },
  glass: {
    id: 'glass',
    name: 'themes.glass.name',
    description: 'themes.glass.description',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: 'rgba(255, 255, 255, 0.1)',
      surface: 'rgba(255, 255, 255, 0.2)',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: 'rgba(255, 255, 255, 0.3)',
      shadow: 'rgba(59, 130, 246, 0.2)',
    },
    gradients: {
      primary: 'from-blue-400/20 via-purple-400/20 to-cyan-400/20',
      secondary: 'from-blue-300/30 to-purple-300/30',
      background: 'from-white/10 via-blue-50/10 to-white/10',
    },
    icon: '🪟',
  },
  spring: {
    id: 'spring',
    name: 'themes.spring.name',
    description: 'themes.spring.description',
    colors: {
      primary: '#10b981',
      secondary: '#f59e0b',
      accent: '#ec4899',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
      textSecondary: '#065f46',
      border: '#bbf7d0',
      shadow: 'rgba(16, 185, 129, 0.15)',
    },
    gradients: {
      primary: 'from-green-100 via-yellow-100 to-pink-100',
      secondary: 'from-green-50 to-yellow-50',
      background: 'from-green-100 via-yellow-100 to-pink-100',
    },
    icon: '🌱',
  },
  summer: {
    id: 'summer',
    name: 'themes.summer.name',
    description: 'themes.summer.description',
    colors: {
      primary: '#f59e0b',
      secondary: '#10b981',
      accent: '#3b82f6',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#92400e',
      textSecondary: '#d97706',
      border: '#fde68a',
      shadow: 'rgba(245, 158, 11, 0.2)',
    },
    gradients: {
      primary: 'from-yellow-100 via-green-100 to-blue-100',
      secondary: 'from-yellow-50 to-green-50',
      background: 'from-yellow-100 via-green-100 to-blue-100',
    },
    icon: '☀️',
  },
  winter: {
    id: 'winter',
    name: 'themes.winter.name',
    description: 'themes.winter.description',
    colors: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#8b5cf6',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#1e40af',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      shadow: 'rgba(59, 130, 246, 0.15)',
    },
    gradients: {
      primary: 'from-blue-100 via-cyan-100 to-indigo-100',
      secondary: 'from-blue-50 to-cyan-50',
      background: 'from-blue-100 via-cyan-100 to-indigo-100',
    },
    icon: '❄️',
  },
  cozy: {
    id: 'cozy',
    name: 'themes.cozy.name',
    description: 'themes.cozy.description',
    colors: {
      primary: '#d97706',
      secondary: '#92400e',
      accent: '#f59e0b',
      background: '#fef3c7',
      surface: '#ffffff',
      text: '#78350f',
      textSecondary: '#92400e',
      border: '#fde68a',
      shadow: 'rgba(217, 119, 6, 0.15)',
    },
    gradients: {
      primary: 'from-amber-100 via-orange-100 to-yellow-100',
      secondary: 'from-amber-50 to-orange-50',
      background: 'from-amber-100 via-orange-100 to-yellow-100',
    },
    icon: '🕯️',
  },
  gradient: {
    id: 'gradient',
    name: 'themes.gradient.name',
    description: 'themes.gradient.description',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#06b6d4',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      shadow: 'rgba(139, 92, 246, 0.2)',
    },
    gradients: {
      primary: 'from-purple-500 via-pink-500 to-cyan-500',
      secondary: 'from-purple-400 to-pink-400',
      background: 'from-purple-100 via-pink-100 to-cyan-100',
    },
    icon: '🌈',
  },
  candy: {
    id: 'candy',
    name: 'themes.candy.name',
    description: 'themes.candy.description',
    colors: {
      primary: '#ec4899',
      secondary: '#f59e0b',
      accent: '#10b981',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#831843',
      textSecondary: '#be185d',
      border: '#fce7f3',
      shadow: 'rgba(236, 72, 153, 0.2)',
    },
    gradients: {
      primary: 'from-pink-100 via-yellow-100 to-green-100',
      secondary: 'from-pink-50 to-yellow-50',
      background: 'from-pink-100 via-yellow-100 to-green-100',
    },
    icon: '🍬',
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
