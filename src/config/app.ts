export const APP_CONFIG = {
  version: '1.2.0',
  developer: {
    name: '小田',
    email: 'phantomps.free@gmail.com',
    github: 'https://github.com/xiaotian-freedom',
  },
  featureKeys: [
    'app.features.randomFood',
    'app.features.foodManagement',
    'app.features.recipeInstructions',
    'app.features.smartRecommendation',
    'app.features.weatherIntegration',
    'app.features.moodBasedRecommendation',
    'app.features.multipleSelectionModes',
    'app.features.achievements',
    'app.features.dailyChallenge',
  ],
  // 开发模式配置
  devMode: {
    enabled: false, // 默认关闭开发模式
    unlimitedUses: true, // 开发模式下无限使用
  },
} as const;

// 开发模式配置类型
export interface DevModeConfig {
  enabled: boolean;
  unlimitedUses: boolean;
}
