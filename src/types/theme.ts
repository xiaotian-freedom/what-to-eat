export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    background: string;
  };
  icon: string;
}

export type ThemeId =
  | 'default'
  | 'dark'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'vintage'
  | 'aurora'
  | 'desert'
  | 'autumn'
  | 'monochrome'
  | 'pastel'
  | 'glass'
  | 'spring'
  | 'summer'
  | 'winter'
  | 'cozy'
  | 'gradient'
  | 'candy';

export interface ThemeState {
  currentTheme: ThemeId;
  themes: Record<ThemeId, Theme>;
}
