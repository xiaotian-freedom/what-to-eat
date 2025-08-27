# PWA 功能说明

## 🚀 PWA 特性

你的"今天吃什么"应用现在已经支持 PWA（Progressive Web App）功能！

### ✨ 主要功能

1. **离线访问** 📱

   - 应用会自动缓存资源，即使没有网络也能正常使用
   - 图片、样式、脚本等都会被缓存

2. **安装到桌面** 🖥️

   - 可以像原生应用一样安装到手机桌面或电脑桌面
   - 支持 iOS、Android、Windows、macOS

3. **自动更新** 🔄

   - 当有新版本时，会自动提示用户更新
   - 无需手动刷新页面

4. **原生体验** 🎯
   - 全屏显示，没有浏览器地址栏
   - 快速启动，接近原生应用的体验

### 📱 如何安装

#### 在手机上（iOS/Android）

1. 用浏览器（Safari/Chrome）打开应用
2. 点击浏览器的"分享"按钮
3. 选择"添加到主屏幕"
4. 确认安装

#### 在电脑上（Chrome/Edge）

1. 打开应用网址
2. 地址栏会出现"安装"图标
3. 点击安装按钮
4. 确认安装

### 🛠️ 开发者信息

#### 缓存策略

- **API 请求**: NetworkFirst - 优先使用网络，失败时使用缓存
- **图片资源**: CacheFirst - 优先使用缓存，提高加载速度
- **静态资源**: 自动预缓存所有必要文件

#### 图标规格

- SVG: 矢量图标，支持任意尺寸
- 192x192: 标准 PWA 图标
- 512x512: 高清 PWA 图标
- 180x180: iOS Safari 专用
- 32x32, 16x16: Favicon

#### 构建命令

```bash
# 构建 PWA 应用
npm run build

# 预览 PWA 应用
npm run preview

# 重新生成图标
npm run generate-icons
```

### 🔧 配置文件

- **vite.config.ts**: PWA 插件配置
- **public/manifest.webmanifest**: 应用清单文件
- **src/components/PWAUpdatePrompt.vue**: 更新提示组件
- **src/components/PWAInstallPrompt.vue**: 安装提示组件

### 📊 PWA 审计

你可以使用以下工具检查 PWA 质量：

1. Chrome DevTools > Lighthouse
2. PWA Builder (pwabuilder.com)
3. Web.dev Measure

### 🌟 最佳实践

1. **HTTPS**: PWA 必须在 HTTPS 环境下运行
2. **响应式设计**: 确保在各种设备上都能正常显示
3. **快速加载**: 首屏加载时间应小于 3 秒
4. **离线功能**: 核心功能应该能够离线使用

### 🎯 用户体验

- 安装后的应用图标会显示你设计的精美图标
- 启动画面会显示应用名称和图标
- 支持手势导航和系统级分享功能
- 可以接收推送通知（如需要可后续添加）

---

**恭喜！** 🎉 你的应用现在已经是一个功能完整的 PWA 了！用户可以像使用原生应用一样使用它。
