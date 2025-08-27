# 自定义标签组件 (CustomTabs)

一个功能丰富、高度可定制的标签组件，完全替代了 van-tabs，支持多种样式和主题色匹配。

## 特性

- 🎨 **多种样式类型**: line、card、pill 三种样式
- 📱 **响应式设计**: 完美适配移动端和桌面端
- 🎯 **主题色匹配**: 自动匹配应用主题色
- ⚡ **高度可定制**: 支持自定义颜色、尺寸、动画等
- 🔧 **TypeScript 支持**: 完整的类型定义
- 🎭 **动画效果**: 流畅的切换动画
- 🏷️ **丰富功能**: 支持图标、徽章、禁用状态等

## 基础用法

```vue
<template>
  <CustomTabs v-model="activeTab" :tabs="tabs" />
</template>

<script setup>
  import { ref } from 'vue';
  import CustomTabs from '@/components/CustomTabs.vue';

  const activeTab = ref('tab1');
  const tabs = [
    { name: 'tab1', title: '标签一' },
    { name: 'tab2', title: '标签二' },
    { name: 'tab3', title: '标签三' },
  ];
</script>
```

## 样式类型

### Line 样式 (默认)

```vue
<CustomTabs v-model="activeTab" :tabs="tabs" type="line" />
```

### Card 样式

```vue
<CustomTabs v-model="activeTab" :tabs="tabs" type="card" />
```

### Pill 样式

```vue
<CustomTabs v-model="activeTab" :tabs="tabs" type="pill" />
```

## 带图标和徽章

```vue
<template>
  <CustomTabs v-model="activeTab" :tabs="tabs" />
</template>

<script setup>
  import IconList from '@/assets/icons/list.svg';

  const tabs = [
    {
      name: 'home',
      title: '首页',
      icon: 'home-o', // van-icon 名称
    },
    {
      name: 'list',
      title: '列表',
      icon: IconList, // 导入的 SVG 图标
    },
    {
      name: 'message',
      title: '消息',
      icon: 'chat-o', // van-icon 名称
      badge: '12',
    },
    {
      name: 'settings',
      title: '设置',
      icon: 'setting-o', // van-icon 名称
      badge: '99+',
    },
  ];
</script>
```

### 图标支持说明

组件支持两种类型的图标：

1. **van-icon 图标**: 使用字符串名称，如 `'home-o'`、`'plus'`、`'search'` 等
2. **SVG 图标**: 导入 SVG 文件后直接使用，如 `IconList`

**可用的 van-icon 名称**:

- `home-o` - 首页
- `plus` - 加号
- `search` - 搜索
- `setting-o` - 设置
- `chat-o` - 聊天
- `success` - 成功
- `cross` - 关闭
- `list` - 列表 (注意：这不是有效的 van-icon 名称)

**使用 SVG 图标的步骤**:

1. 导入 SVG 文件: `import IconList from '@/assets/icons/list.svg'`
2. 在标签配置中使用: `icon: IconList`

````

## 自定义颜色

```vue
<CustomTabs
  v-model="activeTab"
  :tabs="tabs"
  type="card"
  activeColor="#ff6b6b"
  inactiveColor="#666"
  backgroundColor="#f8f9fa"
  borderColor="#e9ecef"
/>
````

## 不同尺寸

```vue
<!-- 小尺寸 -->
<CustomTabs v-model="activeTab" :tabs="tabs" size="small" />

<!-- 中等尺寸 (默认) -->
<CustomTabs v-model="activeTab" :tabs="tabs" size="medium" />

<!-- 大尺寸 -->
<CustomTabs v-model="activeTab" :tabs="tabs" size="large" />
```

## 禁用状态

```vue
<script setup>
  const tabs = [
    { name: 'enabled', title: '启用' },
    { name: 'disabled', title: '禁用', disabled: true },
    { name: 'enabled2', title: '启用' },
  ];
</script>
```

## 使用插槽

```vue
<template>
  <CustomTabs v-model="activeTab" :tabs="tabs">
    <template #tab1>
      <div>标签一的内容</div>
    </template>
    <template #tab2>
      <div>标签二的内容</div>
    </template>
    <template #tab3>
      <div>标签三的内容</div>
    </template>
  </CustomTabs>
</template>
```

## Props

| 属性            | 类型                           | 默认值   | 说明             |
| --------------- | ------------------------------ | -------- | ---------------- |
| modelValue      | string                         | ''       | 当前激活的标签名 |
| tabs            | TabItem[]                      | []       | 标签配置数组     |
| type            | 'line' \| 'card' \| 'pill'     | 'line'   | 标签样式类型     |
| size            | 'small' \| 'medium' \| 'large' | 'medium' | 标签尺寸         |
| theme           | 'auto' \| 'light' \| 'dark'    | 'auto'   | 主题模式         |
| animated        | boolean                        | true     | 是否启用动画     |
| swipeable       | boolean                        | false    | 是否支持滑动切换 |
| sticky          | boolean                        | false    | 是否固定标签头部 |
| color           | string                         | ''       | 自定义颜色       |
| activeColor     | string                         | ''       | 激活状态颜色     |
| inactiveColor   | string                         | ''       | 非激活状态颜色   |
| backgroundColor | string                         | ''       | 背景颜色         |
| borderColor     | string                         | ''       | 边框颜色         |
| borderRadius    | string                         | ''       | 圆角大小         |
| shadow          | boolean                        | true     | 是否显示阴影     |
| fullWidth       | boolean                        | false    | 是否占满宽度     |
| centered        | boolean                        | false    | 是否居中对齐     |
| rightAligned    | boolean                        | false    | 是否右对齐       |
| customClass     | object                         | {}       | 自定义 CSS 类名  |

## TabItem 接口

```typescript
interface TabItem {
  name: string; // 标签唯一标识
  title: string; // 标签标题
  icon?: string | any; // 标签图标 (支持 van-icon 名称、SVG 导入或图片路径)
  badge?: string | number; // 标签徽章
  disabled?: boolean; // 是否禁用
  content?: string; // 标签内容 (当不使用插槽时)
}
```

## Events

| 事件名            | 参数                          | 说明                   |
| ----------------- | ----------------------------- | ---------------------- |
| update:modelValue | value: string                 | 当前激活标签变化时触发 |
| change            | (value: string, tab: TabItem) | 标签切换时触发         |
| click             | tab: TabItem                  | 标签点击时触发         |

## Methods

| 方法名       | 参数         | 返回值 | 说明                 |
| ------------ | ------------ | ------ | -------------------- |
| setActiveTab | name: string | void   | 设置当前激活的标签   |
| getActiveTab | -            | string | 获取当前激活的标签名 |

## 样式定制

### 自定义 CSS 类名

```vue
<CustomTabs
  v-model="activeTab"
  :tabs="tabs"
  :customClass="{
    container: 'my-container',
    header: 'my-header',
    tabItem: 'my-tab-item',
    tabActive: 'my-tab-active',
    indicator: 'my-indicator',
  }"
/>
```

### 主题色变量

组件使用以下 CSS 变量，确保在你的主题系统中定义这些变量：

```css
:root {
  --color-primary: #3b82f6;
  --color-accent: #8b5cf6;
  --color-text: #1f2937;
  --color-textSecondary: #6b7280;
  --color-surface: #ffffff;
  --color-background: #f9fafb;
  --color-border: #e5e7eb;
  --color-hover: #f3f4f6;
  --color-shadow: rgba(0, 0, 0, 0.1);
}
```

## 完整示例

```vue
<template>
  <div class="app">
    <CustomTabs
      v-model="activeTab"
      :tabs="tabs"
      type="card"
      size="medium"
      :animated="true"
      :shadow="true"
      activeColor="#ff6b6b"
      @change="handleTabChange"
    >
      <template #preset>
        <div class="tab-content">
          <h3>预设菜品</h3>
          <p>这里显示预设菜品列表</p>
        </div>
      </template>

      <template #custom>
        <div class="tab-content">
          <h3>自定义添加</h3>
          <p>这里显示自定义添加表单</p>
        </div>
      </template>
    </CustomTabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import CustomTabs from '@/components/CustomTabs.vue';

  const { t } = useI18n();
  const activeTab = ref('preset');

  const tabs = computed(() => [
    {
      name: 'preset',
      title: t('tabs.presetDishes'),
      icon: 'list',
    },
    {
      name: 'custom',
      title: t('tabs.customAdd'),
      icon: 'plus',
    },
  ]);

  const handleTabChange = (value: string, tab: any) => {
    console.log('标签切换:', value, tab);
  };
</script>

<style scoped>
  .app {
    height: 100vh;
    padding: 20px;
  }

  .tab-content {
    padding: 20px;
    text-align: center;
  }

  .tab-content h3 {
    margin-bottom: 10px;
    color: var(--color-text);
  }

  .tab-content p {
    color: var(--color-textSecondary);
  }
</style>
```

## 迁移指南

从 van-tabs 迁移到 CustomTabs：

### 1. 替换组件

```vue
<!-- 旧代码 -->
<van-tabs v-model:active="activeTab">
  <van-tab title="标签一" name="tab1">内容</van-tab>
  <van-tab title="标签二" name="tab2">内容</van-tab>
</van-tabs>

<!-- 新代码 -->
<CustomTabs v-model="activeTab" :tabs="tabs">
  <template #tab1>内容</template>
  <template #tab2>内容</template>
</CustomTabs>
```

### 2. 配置标签数据

```javascript
const tabs = [
  { name: 'tab1', title: '标签一' },
  { name: 'tab2', title: '标签二' },
];
```

### 3. 更新事件处理

```javascript
// 旧代码
const onTabChange = name => {
  console.log('标签切换:', name);
};

// 新代码
const onTabChange = (value, tab) => {
  console.log('标签切换:', value, tab);
};
```

## 注意事项

1. **主题色匹配**: 组件会自动使用 `--color-primary` 等 CSS 变量，确保你的主题系统正确定义了这些变量。

2. **响应式设计**: 组件已经针对移动端进行了优化，在小屏幕上会自动调整布局。

3. **性能优化**: 使用 `v-show` 而不是 `v-if` 来切换标签内容，避免重复渲染。

4. **无障碍访问**: 组件支持键盘导航和屏幕阅读器。

5. **TypeScript**: 完整的类型定义，提供良好的开发体验。
