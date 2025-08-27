# 输入框文字颜色修复说明

## 问题描述

在 AddFoodPage.vue 中，自定义输入菜品名称的输入框在输入文字后看不清，文字颜色没有正确适配主题色系统。

## 问题原因

1. **van-field 组件样式覆盖**: van-field 组件有自己的默认样式，覆盖了主题色设置
2. **CSS 优先级问题**: 原有的样式设置优先级不够高，无法覆盖 van-field 的默认样式
3. **深度选择器缺失**: 没有使用 `:deep()` 选择器来访问 van-field 内部的输入框元素

## 解决方案

### 1. 自定义输入框样式

为菜品名称输入框添加了专门的 CSS 类：

```vue
<van-field
  v-model="foodName"
  :placeholder="t('form.dishNamePlaceholder')"
  class="custom-input-field"
  :style="{
    border: '1px solid var(--color-primary)',
    backgroundColor: 'var(--color-surface)',
  }"
  :border="false"
  input-align="center"
  clearable
/>
```

### 2. CSS 样式修复

添加了完整的输入框样式，确保文字颜色正确显示：

```css
/* 自定义输入框样式 */
.custom-input-field {
  border-radius: 12px !important;
  padding: 12px 16px !important;
  font-size: 16px !important;
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-primary) !important;
  color: var(--color-text) !important;
  transition: all 0.3s ease;
}

.custom-input-field:focus {
  border-color: var(--color-accent) !important;
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2) !important;
}

.custom-input-field::placeholder {
  color: var(--color-textSecondary) !important;
}

/* 确保 van-field 内部输入框的文字颜色正确 */
.custom-input-field :deep(.van-field__control) {
  color: var(--color-text) !important;
  background-color: transparent !important;
}

.custom-input-field :deep(.van-field__control::placeholder) {
  color: var(--color-textSecondary) !important;
}

.custom-input-field :deep(.van-field__clear) {
  color: var(--color-textSecondary) !important;
}
```

### 3. 搜索框样式修复

同样为搜索框添加了样式修复：

```css
/* 确保搜索框内部输入框的文字颜色正确 */
.search-field :deep(.van-field__control) {
  color: var(--color-text) !important;
  background-color: transparent !important;
}

.search-field :deep(.van-field__control::placeholder) {
  color: var(--color-textSecondary) !important;
}

.search-field :deep(.van-field__clear) {
  color: var(--color-textSecondary) !important;
}
```

## 关键技术点

### 1. 使用 `:deep()` 选择器

`:deep()` 选择器是 Vue 3 中用于穿透组件样式的作用域选择器，可以访问子组件的内部元素：

```css
.custom-input-field :deep(.van-field__control) {
  /* 样式会应用到 van-field 内部的输入框 */
}
```

### 2. 使用 `!important` 提高优先级

由于 van-field 组件可能有自己的样式，使用 `!important` 确保我们的样式能够覆盖默认样式。

### 3. 主题色变量

使用 CSS 变量确保样式与主题系统一致：

- `var(--color-text)`: 主要文字颜色
- `var(--color-textSecondary)`: 次要文字颜色
- `var(--color-surface)`: 表面背景色
- `var(--color-primary)`: 主色调
- `var(--color-accent)`: 强调色

## 修复效果

### 修复前

- ❌ 输入框文字看不清
- ❌ 占位符文字颜色不正确
- ❌ 清除按钮颜色不正确
- ❌ 搜索框也有同样的问题

### 修复后

- ✅ 输入框文字清晰可见
- ✅ 占位符文字颜色正确
- ✅ 清除按钮颜色正确
- ✅ 搜索框文字也正确显示
- ✅ 完全适配主题色系统
- ✅ 保持了良好的用户体验

## 测试验证

1. **构建测试**: `npm run build` 成功
2. **功能测试**: 输入框文字清晰可见
3. **主题测试**: 在不同主题下文字颜色都正确
4. **交互测试**: 聚焦、清除等功能正常

## 注意事项

1. **样式优先级**: 使用 `!important` 确保样式生效
2. **深度选择器**: 必须使用 `:deep()` 访问子组件元素
3. **主题兼容**: 确保所有颜色都使用主题变量
4. **响应式设计**: 样式在不同屏幕尺寸下都正常工作

## 相关文件

- `src/views/AddFoodPage.vue`: 主要修复文件
- `docs/CUSTOM_TABS_SUMMARY.md`: 修复记录
- `docs/INPUT_FIELD_FIX.md`: 本文档
