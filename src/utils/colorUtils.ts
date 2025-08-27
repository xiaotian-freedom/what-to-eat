/**
 * 颜色工具类
 * 提供主题颜色获取、对比度计算、渐变生成等功能
 */

// 主题颜色映射
const THEME_COLORS = {
  default: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
  dark: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
  },
  sunset: {
    primary: '#f97316',
    secondary: '#ec4899',
    accent: '#fbbf24',
    background: '#fef3c7',
    surface: '#ffffff',
    text: '#92400e',
    textSecondary: '#d97706',
    border: '#fde68a',
  },
  ocean: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#0ea5e9',
    background: '#f0f9ff',
    surface: '#ffffff',
    text: '#0c4a6e',
    textSecondary: '#0369a1',
    border: '#bae6fd',
  },
  forest: {
    primary: '#059669',
    secondary: '#047857',
    accent: '#10b981',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#064e3b',
    textSecondary: '#065f46',
    border: '#bbf7d0',
  },
  vintage: {
    primary: '#a855f7',
    secondary: '#7c3aed',
    accent: '#f59e0b',
    background: '#fdf4ff',
    surface: '#ffffff',
    text: '#581c87',
    textSecondary: '#7c3aed',
    border: '#e9d5ff',
  },
} as const;

type ThemeName = keyof typeof THEME_COLORS;
type ColorKey = keyof typeof THEME_COLORS.default;

/**
 * 获取当前主题名称
 */
export const getCurrentTheme = (): ThemeName => {
  if (typeof window === 'undefined') return 'default';

  const body = document.body;
  if (body.classList.contains('theme-dark')) return 'dark';
  if (body.classList.contains('theme-sunset')) return 'sunset';
  if (body.classList.contains('theme-ocean')) return 'ocean';
  if (body.classList.contains('theme-forest')) return 'forest';
  if (body.classList.contains('theme-vintage')) return 'vintage';

  return 'default';
};

/**
 * 获取当前主题的颜色值
 * @param cssVar CSS变量名（如 '--color-primary'）
 * @returns 颜色值（十六进制格式）
 */
export const getThemeColor = (cssVar: string): string => {
  // 首先尝试从CSS变量获取
  if (typeof window !== 'undefined') {
    const computed = getComputedStyle(document.documentElement);
    const color = computed.getPropertyValue(cssVar).trim();
    if (color) return color;
  }

  // 如果无法获取CSS变量，从主题配置中获取
  const currentTheme = getCurrentTheme();
  const colorKey = cssVar.replace('--color-', '') as ColorKey;

  return THEME_COLORS[currentTheme][colorKey] || THEME_COLORS.default[colorKey] || '#6366f1';
};

/**
 * 将十六进制颜色转换为RGBA格式
 * @param hex 十六进制颜色值
 * @param alpha 透明度 (0-1)
 * @returns RGBA颜色字符串
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  const color = hex.replace('#', '');
  if (color.length !== 6) return `rgba(99, 102, 241, ${alpha})`; // 默认颜色

  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * 计算颜色亮度
 * @param hex 十六进制颜色值
 * @returns 亮度值 (0-255)
 */
export const getColorBrightness = (hex: string): number => {
  const color = hex.replace('#', '');
  if (color.length !== 6) return 128; // 默认中等亮度

  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // 使用相对亮度公式
  return (r * 299 + g * 587 + b * 114) / 1000;
};

/**
 * 根据背景颜色计算最佳文字颜色（确保对比度）
 * @param backgroundColor 背景颜色（十六进制或CSS变量）
 * @param threshold 亮度阈值，默认140
 * @returns 文字颜色（十六进制格式）
 */
export const getContrastTextColor = (backgroundColor: string, threshold: number = 140): string => {
  // 处理CSS变量
  if (backgroundColor.startsWith('var(')) {
    backgroundColor = getThemeColor(backgroundColor.slice(4, -1));
  }

  const brightness = getColorBrightness(backgroundColor);

  // 如果亮度大于阈值，使用深色文字；否则使用浅色文字
  return brightness > threshold ? '#1f2937' : '#ffffff';
};

/**
 * 根据文字颜色获取合适的阴影效果
 * @param textColor 文字颜色
 * @returns CSS text-shadow 值
 */
export const getTextShadow = (textColor: string): string => {
  // 如果是白色文字，使用黑色阴影；如果是深色文字，使用白色阴影
  if (textColor === '#ffffff') {
    return '1px 1px 2px rgba(0, 0, 0, 0.5), 0 0 4px rgba(0, 0, 0, 0.3)';
  } else {
    return '1px 1px 2px rgba(255, 255, 255, 0.5), 0 0 4px rgba(255, 255, 255, 0.3)';
  }
};

/**
 * 获取带透明度的渐变背景
 * @param opacity 透明度 (0-1)，默认0.2
 * @param direction 渐变方向，默认'to right'
 * @returns CSS渐变字符串
 */
export const getTransparentGradient = (
  opacity: number = 0.2,
  direction: string = 'to right'
): string => {
  const primaryColor = getThemeColor('--color-primary');
  const secondaryColor = getThemeColor('--color-secondary');

  const primaryRgba = hexToRgba(primaryColor, opacity);
  const secondaryRgba = hexToRgba(secondaryColor, opacity);

  return `linear-gradient(${direction}, ${primaryRgba}, ${secondaryRgba})`;
};

/**
 * 获取主题渐变背景（不透明）
 * @param direction 渐变方向，默认'to right'
 * @returns CSS渐变字符串
 */
export const getThemeGradient = (direction: string = 'to right'): string => {
  const primaryColor = getThemeColor('--color-primary');
  const secondaryColor = getThemeColor('--color-secondary');

  return `linear-gradient(${direction}, ${primaryColor}, ${secondaryColor})`;
};

/**
 * 获取单色带透明度的背景
 * @param colorKey 颜色键名（如 'primary', 'secondary'）
 * @param opacity 透明度 (0-1)
 * @returns RGBA颜色字符串
 */
export const getTransparentColor = (colorKey: string, opacity: number): string => {
  const color = getThemeColor(`--color-${colorKey}`);
  return hexToRgba(color, opacity);
};

/**
 * 获取Canvas绘制用的阴影配置
 * @param textColor 文字颜色
 * @returns 阴影配置对象
 */
export const getCanvasShadowConfig = (textColor: string) => {
  const isWhiteText = textColor === '#ffffff';

  return {
    shadowColor: isWhiteText ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    shadowBlur: isWhiteText ? 2 : 1,
    shadowOffsetX: isWhiteText ? 1 : 0.5,
    shadowOffsetY: isWhiteText ? 1 : 0.5,
  };
};

/**
 * 预设的透明度级别
 */
export const OPACITY_LEVELS = {
  subtle: 0.1,
  light: 0.15,
  medium: 0.2,
  strong: 0.3,
  bold: 0.4,
} as const;

/**
 * 预设的渐变方向
 */
export const GRADIENT_DIRECTIONS = {
  horizontal: 'to right',
  vertical: 'to bottom',
  diagonal: 'to bottom right',
  radial: 'radial-gradient(circle',
} as const;

/**
 * 颜色工具类的默认导出对象
 */
export const ColorUtils = {
  getCurrentTheme,
  getThemeColor,
  hexToRgba,
  getColorBrightness,
  getContrastTextColor,
  getTextShadow,
  getTransparentGradient,
  getThemeGradient,
  getTransparentColor,
  getCanvasShadowConfig,
  OPACITY_LEVELS,
  GRADIENT_DIRECTIONS,
  THEME_COLORS,
};

export default ColorUtils;
