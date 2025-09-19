# 问题反馈功能

## 功能概述

问题反馈功能允许用户向开发团队提交问题报告、功能建议和改进意见。该功能已集成到设置页面中，提供友好的用户界面和完整的反馈流程。

## 功能特性

### 1. 反馈类型
- 🐛 **Bug 报告**: 报告应用中的错误和问题
- 💡 **功能建议**: 提出新功能的需求
- ⚡ **改进建议**: 对现有功能的优化建议
- 💬 **其他**: 其他类型的反馈

### 2. 反馈内容
- **必填内容**: 详细的反馈描述（最少10个字符）
- **可选联系方式**: 邮箱或微信号，用于后续回复
- **自动设备信息**: 自动收集设备、浏览器和版本信息

### 3. 用户体验
- 响应式设计，适配各种设备
- 实时字符计数和验证
- 提交状态反馈
- 多语言支持（中文/英文）

## 技术实现

### 文件结构
```
src/
├── views/
│   └── FeedbackPage.vue          # 反馈页面组件
├── types/
│   └── feedback.ts               # 反馈相关类型定义
├── utils/
│   └── feedbackApi.ts            # 反馈API服务
├── locales/
│   ├── zh-CN.ts                  # 中文国际化文本
│   └── en-US.ts                  # 英文国际化文本
└── router/
    └── index.ts                  # 路由配置
```

### 核心组件

#### FeedbackPage.vue
- 反馈表单界面
- 表单验证和提交逻辑
- 设备信息自动收集
- 多语言支持

#### feedback.ts (类型定义)
```typescript
export enum FeedbackType {
  BUG = 'bug',
  FEATURE = 'feature', 
  IMPROVEMENT = 'improvement',
  OTHER = 'other',
}

export interface FeedbackData {
  type: FeedbackType;
  content: string;
  contact?: string;
  deviceInfo: DeviceInfo;
  timestamp: string;
  userAgent: string;
}
```

#### feedbackApi.ts (API服务)
- `submitFeedback()`: 提交反馈
- `getFeedbackList()`: 获取反馈列表
- `getFeedbackDetail()`: 获取反馈详情
- `updateFeedbackStatus()`: 更新反馈状态

## 使用方法

### 1. 访问反馈页面
- 在设置页面点击"问题反馈"选项
- 或直接访问 `/feedback` 路由

### 2. 填写反馈信息
1. 选择反馈类型
2. 输入详细的反馈内容（必填）
3. 可选择填写联系方式
4. 查看自动收集的设备信息

### 3. 提交反馈
- 点击"提交反馈"按钮
- 等待提交完成
- 查看成功提示

## API 接口

### 提交反馈
```typescript
POST /api/feedback/submit
{
  "type": "bug",
  "content": "详细的问题描述...",
  "contact": "user@example.com",
  "deviceInfo": {
    "device": "iPhone",
    "browser": "Safari", 
    "version": "1.0.0"
  },
  "userAgent": "Mozilla/5.0..."
}
```

### 响应格式
```typescript
{
  "success": true,
  "message": "反馈提交成功",
  "feedbackId": "feedback_1234567890"
}
```

## 国际化支持

### 中文文本
- 反馈类型: Bug 报告、功能建议、改进建议、其他
- 表单标签: 反馈内容、联系方式、设备信息
- 提示信息: 提交成功、提交失败等

### 英文文本
- 反馈类型: Bug Report、Feature Request、Improvement、Other
- 表单标签: Feedback Content、Contact Information、Device Information
- 提示信息: Submit Success、Submit Failed等

## 待实现功能

### 后端API
- [ ] 实现真实的反馈提交API
- [ ] 反馈数据存储和管理
- [ ] 反馈状态跟踪
- [ ] 管理员回复功能

### 管理功能
- [ ] 反馈列表查看
- [ ] 反馈状态管理
- [ ] 批量操作
- [ ] 数据统计和分析

### 用户体验优化
- [ ] 反馈历史记录
- [ ] 反馈状态查询
- [ ] 邮件通知
- [ ] 反馈评分系统

## 注意事项

1. **API暂时为空**: 当前使用模拟API，实际部署时需要实现真实的后端接口
2. **数据验证**: 前端已实现基础验证，后端需要额外的安全验证
3. **隐私保护**: 联系方式为可选，用户可自主选择是否提供
4. **设备信息**: 自动收集的设备信息有助于问题定位和解决

## 更新日志

- **v1.0.0** (2024-01-XX): 初始版本，包含基础反馈功能
  - 反馈表单界面
  - 类型选择和内容输入
  - 设备信息自动收集
  - 多语言支持
  - 模拟API实现
