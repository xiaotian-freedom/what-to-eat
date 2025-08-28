<template>
  <div class="custom-tabs-container" :class="containerClass">
    <!-- 标签头部 -->
    <div class="tabs-header" :class="headerClass">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-item"
        :class="[
          tabItemClass,
          { 'tab-active': activeTab === tab.name },
          { 'tab-disabled': tab.disabled },
        ]"
        :style="getTabItemStyle(tab)"
        @click="handleTabClick(tab)"
      >
        <!-- 标签图标 -->
        <div v-if="tab.icon" class="tab-icon" :class="iconClass">
          <img
            v-if="
              typeof tab.icon === 'string' && (tab.icon.includes('.') || tab.icon.startsWith('/'))
            "
            :src="tab.icon"
            :alt="tab.title"
          />
          <img
            v-else-if="typeof tab.icon === 'object' || typeof tab.icon === 'function'"
            :src="tab.icon"
            :alt="tab.title"
          />
          <van-icon v-else :name="tab.icon" />
        </div>

        <!-- 标签标题 -->
        <span class="tab-title" :class="titleClass">{{ tab.title }}</span>

        <!-- 标签徽章 -->
        <div v-if="tab.badge" class="tab-badge" :class="badgeClass">
          {{ tab.badge }}
        </div>

        <!-- 激活指示器 -->
        <div v-if="activeTab === tab.name" class="tab-indicator" :class="indicatorClass"></div>
      </div>
    </div>

    <!-- 标签内容 -->
    <div class="tabs-content" :class="contentClass">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-panel"
        :class="[panelClass, { 'panel-active': activeTab === tab.name }]"
        v-show="activeTab === tab.name"
      >
        <slot :name="tab.name" :tab="tab">
          {{ tab.content }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  // import { useThemeStore } from '@/stores/theme' // 暂时未使用，保留以备将来扩展主题功能

  export interface TabItem {
    name: string;
    title: string;
    icon?: string;
    badge?: string | number;
    disabled?: boolean;
    content?: string;
  }

  interface Props {
    modelValue?: string;
    tabs: TabItem[];
    type?: 'line' | 'card' | 'pill';
    size?: 'small' | 'medium' | 'large';
    theme?: 'auto' | 'light' | 'dark';
    animated?: boolean;
    swipeable?: boolean;
    sticky?: boolean;
    color?: string;
    activeColor?: string;
    inactiveColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: string;
    shadow?: boolean;
    fullWidth?: boolean;
    centered?: boolean;
    rightAligned?: boolean;
    customClass?: {
      container?: string;
      header?: string;
      tabItem?: string;
      tabActive?: string;
      tabDisabled?: string;
      icon?: string;
      title?: string;
      badge?: string;
      indicator?: string;
      content?: string;
      panel?: string;
      panelActive?: string;
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    type: 'line',
    size: 'medium',
    theme: 'auto',
    animated: true,
    swipeable: false,
    sticky: false,
    color: '',
    activeColor: '',
    inactiveColor: '',
    backgroundColor: '',
    borderColor: '',
    borderRadius: '',
    shadow: true,
    fullWidth: false,
    centered: false,
    rightAligned: false,
    customClass: () => ({}),
  });

  const emit = defineEmits<{
    'update:modelValue': [value: string];
    change: [value: string, tab: TabItem];
    click: [tab: TabItem];
  }>();

  // const themeStore = useThemeStore() // 暂时未使用，保留以备将来扩展主题功能
  const activeTab = ref(props.modelValue || (props.tabs.length > 0 ? props.tabs[0].name : ''));

  // 监听 modelValue 变化
  watch(
    () => props.modelValue,
    newValue => {
      if (newValue && newValue !== activeTab.value) {
        activeTab.value = newValue;
      }
    }
  );

  // 监听 activeTab 变化
  watch(activeTab, newValue => {
    emit('update:modelValue', newValue);
  });

  // 计算样式类名
  const containerClass = computed(() => [
    'custom-tabs',
    `tabs-${props.type}`,
    `tabs-${props.size}`,
    `tabs-${props.theme}`,
    {
      'tabs-animated': props.animated,
      'tabs-shadow': props.shadow,
      'tabs-full-width': props.fullWidth,
      'tabs-centered': props.centered,
      'tabs-right-aligned': props.rightAligned,
      'tabs-sticky': props.sticky,
    },
    props.customClass.container,
  ]);

  const headerClass = computed(() => ['tabs-header', props.customClass.header]);

  const tabItemClass = computed(() => ['tab-item', props.customClass.tabItem]);

  const iconClass = computed(() => ['tab-icon', props.customClass.icon]);

  const titleClass = computed(() => ['tab-title', props.customClass.title]);

  const badgeClass = computed(() => ['tab-badge', props.customClass.badge]);

  const indicatorClass = computed(() => ['tab-indicator', props.customClass.indicator]);

  const contentClass = computed(() => ['tabs-content', props.customClass.content]);

  const panelClass = computed(() => ['tab-panel', props.customClass.panel]);

  // 获取标签项样式
  const getTabItemStyle = (tab: TabItem) => {
    const isActive = activeTab.value === tab.name;
    const isDisabled = tab.disabled;

    const styles: Record<string, string> = {};

    // 颜色处理
    if (isActive) {
      styles.color = props.activeColor || `var(--color-primary)`;
    } else if (isDisabled) {
      styles.color = `var(--color-textSecondary)`;
    } else {
      styles.color = props.inactiveColor || `var(--color-text)`;
    }

    // 背景色
    if (props.backgroundColor) {
      styles.backgroundColor = props.backgroundColor;
    }

    // 边框色
    if (props.borderColor) {
      styles.borderColor = props.borderColor;
    }

    // 圆角
    if (props.borderRadius) {
      styles.borderRadius = props.borderRadius;
    }

    return styles;
  };

  // 处理标签点击
  const handleTabClick = (tab: TabItem) => {
    if (tab.disabled) return;

    emit('click', tab);

    if (activeTab.value !== tab.name) {
      activeTab.value = tab.name;
      emit('change', tab.name, tab);
    }
  };

  // 暴露方法
  defineExpose({
    setActiveTab: (name: string) => {
      activeTab.value = name;
    },
    getActiveTab: () => activeTab.value,
  });
</script>

<style scoped>
  .custom-tabs-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* 标签头部样式 */
  .tabs-header {
    display: flex;
    align-items: center;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: relative;
    z-index: 10;
  }

  .tabs-sticky .tabs-header {
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .tabs-full-width .tabs-header {
    width: 100%;
  }

  .tabs-centered .tabs-header {
    justify-content: center;
  }

  .tabs-right-aligned .tabs-header {
    justify-content: flex-end;
  }

  /* 标签项样式 */
  .tab-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    background: transparent;
    font-weight: 500;
    user-select: none;
    min-height: 44px;
    flex: 1;
    max-width: 200px;
  }

  .tab-item:active {
    transform: scale(0.98);
  }

  .tab-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .tab-disabled:active {
    transform: none;
  }

  /* 激活状态 */
  .tab-active {
    color: var(--color-primary) !important;
    font-weight: 600;
  }

  /* 标签图标 */
  .tab-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    font-size: 16px;
  }

  .tab-icon img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  /* 标签标题 */
  .tab-title {
    font-size: 14px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 标签徽章 */
  .tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    margin-left: 6px;
    background: var(--color-accent);
    color: white;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
  }

  /* 激活指示器 */
  .tab-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-primary);
    border-radius: 1px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* 标签内容 */
  .tabs-content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .tab-panel {
    height: 100%;
    overflow-y: auto;
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .panel-active {
    opacity: 1;
    transform: translateX(0);
  }

  /* 类型样式 */
  /* Line 类型 */
  .tabs-line .tab-item {
    border-bottom: 2px solid transparent;
  }

  .tabs-line .tab-active {
    border-bottom-color: var(--color-primary);
  }

  .tabs-line .tab-indicator {
    display: none;
  }

  /* Card 类型 */
  .tabs-card .tabs-header {
    background: var(--color-background);
    border-bottom: none;
    padding: 8px;
    gap: 8px;
    justify-content: center;
  }

  .tabs-card .tab-item {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    margin: 0;
    flex: none;
    min-width: 120px;
  }

  .tabs-card .tab-active {
    background: var(--color-primary);
    color: white !important;
    border-color: var(--color-primary);
  }

  .tabs-card .tab-indicator {
    display: none;
  }

  /* Pill 类型 */
  .tabs-pill .tabs-header {
    background: var(--color-background);
    border-bottom: none;
    padding: 8px;
    gap: 8px;
    justify-content: center;
  }

  .tabs-pill .tab-item {
    background: var(--color-surface);
    border-radius: 20px;
    margin: 0;
    flex: none;
    min-width: 100px;
  }

  .tabs-pill .tab-active {
    background: var(--color-primary);
    color: white !important;
  }

  .tabs-pill .tab-indicator {
    display: none;
  }

  /* 尺寸样式 */
  .tabs-small .tab-item {
    padding: 8px 12px;
    min-height: 36px;
    font-size: 12px;
  }

  .tabs-small .tab-icon {
    font-size: 14px;
  }

  .tabs-small .tab-icon img {
    width: 14px;
    height: 14px;
  }

  .tabs-large .tab-item {
    padding: 16px 20px;
    min-height: 52px;
    font-size: 16px;
  }

  .tabs-large .tab-icon {
    font-size: 18px;
  }

  .tabs-large .tab-icon img {
    width: 18px;
    height: 18px;
  }

  /* 主题样式 */
  .tabs-light .tabs-header {
    background: #ffffff;
    border-bottom-color: #e5e7eb;
  }

  .tabs-dark .tabs-header {
    background: #1f2937;
    border-bottom-color: #374151;
  }

  .tabs-dark .tab-item {
    color: #d1d5db;
  }

  .tabs-dark .tab-active {
    color: #3b82f6 !important;
  }

  /* 动画效果 */
  .tabs-animated .tab-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tabs-animated .tab-indicator {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* 阴影效果 */
  .tabs-shadow .tabs-header {
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  .tabs-shadow.tabs-card .tab-item {
    box-shadow: 0 2px 4px var(--color-shadow);
  }

  .tabs-shadow.tabs-pill .tab-item {
    box-shadow: 0 2px 4px var(--color-shadow);
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .tab-item {
      padding: 10px 12px;
      min-height: 40px;
      font-size: 13px;
    }

    .tab-icon {
      margin-right: 6px;
      font-size: 14px;
    }

    .tab-icon img {
      width: 14px;
      height: 14px;
    }

    .tab-title {
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    .tabs-header {
      flex-wrap: wrap;
    }

    .tab-item {
      flex: 1 1 50%;
      min-width: 0;
    }
  }
</style>
