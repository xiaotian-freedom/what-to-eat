# 主题系统说明

## 概述

本项目新增了完整的主题管理系统，支持 6 种不同的主题风格，用户可以在设置页面中自由切换主题。

## 功能特性

### 🎨 6 种精美主题

- **默认主题** - 清新简约的蓝紫色调
- **深色主题** - 护眼的深色模式
- **日落主题** - 温暖的橙黄色调
- **海洋主题** - 清凉的蓝绿色调
- **森林主题** - 自然的绿色调
- **复古主题** - 怀旧的紫色调

### 🔄 实时切换

- 主题切换即时生效，无需刷新页面
- 平滑的过渡动画效果
- 主题设置自动保存到本地存储

### 📱 响应式设计

- 所有主题都适配移动端和桌面端
- 保持一致的视觉体验

## 使用方法

### 1. 进入主题设置

1. 打开应用
2. 点击右上角菜单按钮
3. 选择"系统设置"
4. 点击"主题"选项

### 2. 选择主题

- 在底部弹出的主题选择器中
- 点击任意主题卡片即可切换
- 当前选中的主题会有蓝色边框和勾选图标

### 3. 主题预览

- 每个主题卡片都显示主题图标和颜色预览
- 实时预览主题效果

## 技术实现

### 文件结构

```
src/
├── types/
│   └── theme.ts              # 主题类型定义
├── stores/
│   └── theme.ts              # 主题状态管理
├── components/
│   └── ThemeSelector.vue     # 主题选择器组件
├── assets/
│   └── css/
│       └── themes.css        # 主题样式文件
└── views/
    └── SettingsPage.vue      # 设置页面（已更新）
```

### 核心功能

#### 1. 主题存储 (Pinia Store)

- 管理当前主题状态
- 提供主题切换方法
- 自动保存到 localStorage

#### 2. CSS 变量系统

- 使用 CSS 自定义属性定义主题颜色
- 支持动态切换主题样式
- 平滑的过渡动画

#### 3. 主题选择器组件

- 网格布局展示所有主题
- 实时预览主题效果
- 响应式设计

## 主题配置

### 添加新主题

1. 在 `src/types/theme.ts` 中添加新主题 ID
2. 在 `src/stores/theme.ts` 中定义主题配置
3. 在 `src/assets/css/themes.css` 中添加 CSS 样式
4. 更新国际化文件中的主题名称

### 主题配置结构

```typescript
interface Theme {
  id: string; // 主题ID
  name: string; // 主题名称
  description: string; // 主题描述
  colors: {
    // 颜色配置
    primary: string; // 主色调
    secondary: string; // 次要色调
    accent: string; // 强调色
    background: string; // 背景色
    surface: string; // 表面色
    text: string; // 文本色
    textSecondary: string; // 次要文本色
    border: string; // 边框色
    shadow: string; // 阴影色
  };
  gradients: {
    // 渐变配置
    primary: string; // 主渐变
    secondary: string; // 次要渐变
    background: string; // 背景渐变
  };
  icon: string; // 主题图标
}
```

## 国际化支持

主题系统支持多语言，相关翻译键：

```typescript
// 中文
'settings.theme': '主题'
'settings.themeDesc': '选择你喜欢的主题风格'

// 英文
'settings.theme': 'Theme'
'settings.themeDesc': 'Choose your favorite theme style'
```

## 浏览器兼容性

- ✅ Chrome 88+
- ✅ Firefox 87+
- ✅ Safari 14+
- ✅ Edge 88+

## 性能优化

- 使用 CSS 变量实现主题切换，性能优异
- 主题配置按需加载
- 平滑的过渡动画使用 CSS transition
- 本地存储避免重复加载

## 未来计划

- [ ] 支持自定义主题
- [ ] 主题预览功能增强
- [ ] 自动主题切换（根据时间/系统设置）
- [ ] 主题分享功能
- [ ] 更多主题样式

## 贡献指南

欢迎提交新的主题设计！请确保：

1. 主题色彩搭配协调
2. 保持良好的对比度
3. 适配移动端显示
4. 提供完整的主题配置
5. 更新相关文档

---

如有问题或建议，请提交 Issue 或 Pull Request。
