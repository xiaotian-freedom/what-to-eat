# 多语言功能使用说明

## 概述

本项目已成功集成 Vue I18n 多语言功能，支持中文和英文两种语言。

## 功能特性

- ✅ 支持中英文切换
- ✅ 自动检测浏览器语言
- ✅ 语言选择持久化存储
- ✅ 类型安全的翻译键
- ✅ 响应式语言切换

## 使用方法

### 1. 语言切换

在页面右上角可以看到语言切换按钮，点击可以切换中英文：

- 🇨🇳 中文
- 🇺🇸 English

### 2. 在组件中使用翻译

```vue
<template>
  <!-- 使用 $t 函数 -->
  <h1>{{ $t('pages.home') }}</h1>
  <button>{{ $t('buttons.randomFood') }}</button>
</template>

<script setup>
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  // 在 JavaScript 中使用
  const message = t('messages.addSuccess');
</script>
```

### 3. 翻译键结构

```
common.          - 通用文本（确认、取消、保存等）
pages.           - 页面标题
buttons.         - 按钮文本
guide.           - 引导页面文本
form.            - 表单相关文本
messages.        - 提示信息
achievements.    - 成就系统
challenge.       - 挑战系统
```

## 文件结构

```
src/locales/
├── index.ts          # i18n配置文件
├── zh-CN.ts          # 中文语言包
└── en-US.ts          # 英文语言包
```

## 添加新的翻译

1. 在 `src/locales/zh-CN.ts` 中添加中文翻译
2. 在 `src/locales/en-US.ts` 中添加对应的英文翻译
3. 在组件中使用 `$t('key')` 或 `t('key')`

## 技术实现

- **Vue I18n**: 国际化核心库
- **Composition API**: 使用 `useI18n()` 组合式 API
- **LocalStorage**: 语言选择持久化
- **TypeScript**: 类型安全的翻译键

## 浏览器兼容性

- 自动检测浏览器语言设置
- 默认使用中文
- 支持语言切换和记忆功能
