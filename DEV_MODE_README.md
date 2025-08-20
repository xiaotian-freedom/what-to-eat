# 开发模式功能说明

## 概述

为了解决开发过程中只能选择菜品 3 次的问题，我们添加了开发模式配置开关。在开发模式下，用户可以无限次使用随机选菜功能，方便开发和测试。

## 功能特性

### 1. 开发模式开关

- 位置：设置页面 → 开发模式
- 功能：开启/关闭开发模式
- 状态持久化：开关状态会保存到 localStorage

### 2. 开发模式下的行为

- **无限使用**：可以无限次使用随机选菜功能
- **不增加使用次数**：不会增加每日使用次数计数
- **状态显示**：挑战状态面板显示"∞"符号
- **特殊提示**：显示"开发模式：无限使用"提示

### 3. 正常模式下的行为

- **限制使用**：每日最多使用 3 次
- **计数增加**：每次使用会增加使用次数
- **状态显示**：显示剩余使用次数
- **限制提示**：达到限制时显示相应提示

## 技术实现

### 1. 配置文件 (`src/config/app.ts`)

```typescript
devMode: {
  enabled: false, // 默认关闭开发模式
  unlimitedUses: true, // 开发模式下无限使用
}
```

### 2. 开发模式 Store (`src/stores/devMode.ts`)

- 管理开发模式状态
- 提供切换和设置方法
- 支持 localStorage 持久化

### 3. 挑战 Store 集成 (`src/stores/challenge.ts`)

- 修改`canUseToday`计算属性
- 修改`remainingUses`计算属性
- 修改`useRandomFood`方法

### 4. UI 组件更新

- **设置页面**：添加开发模式开关
- **挑战状态面板**：显示开发模式状态
- **HomeCard 组件**：开发模式下的提示信息

## 使用方法

### 开启开发模式

1. 进入设置页面
2. 点击"开发模式"开关
3. 开关变为橙色，显示"开发模式已开启"

### 关闭开发模式

1. 进入设置页面
2. 再次点击"开发模式"开关
3. 开关变为灰色，显示"开发模式已关闭"

## 国际化支持

### 中文文本

- `settings.devMode`: "开发模式"
- `settings.devModeDesc`: "开启后可无限使用随机选菜功能"
- `settings.devModeEnabled`: "开发模式已开启"
- `settings.devModeDisabled`: "开发模式已关闭"

### 英文文本

- `settings.devMode`: "Developer Mode"
- `settings.devModeDesc`: "Enable unlimited random food selection"
- `settings.devModeEnabled`: "Developer mode enabled"
- `settings.devModeDisabled`: "Developer mode disabled"

## 注意事项

1. **生产环境**：默认关闭开发模式，确保生产环境的安全性
2. **状态持久化**：开发模式状态会保存到 localStorage，刷新页面后保持
3. **向后兼容**：不影响现有的挑战和成就系统
4. **UI 一致性**：开发模式下的 UI 保持与正常模式一致的设计风格

## 未来扩展

1. **更多开发选项**：可以添加更多开发相关的配置选项
2. **权限控制**：可以添加基于用户角色的开发模式权限控制
3. **日志记录**：可以添加开发模式下的操作日志记录
4. **测试模式**：可以添加专门的测试模式，用于自动化测试
