# 今天吃什么 - 美食决策助手

<div align="center">
  <img src="screenshots/logo.png" alt="今天吃什么 Logo" width="120">
  <h3>解决"吃什么"的终极难题</h3>
  
  ![GitHub stars](https://img.shields.io/github/stars/yourusername/what-to-eat?style=social)
  ![Version](https://img.shields.io/badge/版本-1.0.0-blue)
  ![License](https://img.shields.io/badge/许可证-MIT-green)
</div>

## 📱 项目概述

**今天吃什么**是一款精美的Web应用，专为纠结选择"吃什么"的人群设计。通过随机选择功能，华丽的动画效果和简洁的界面，它让用户轻松地在自己喜爱的菜品中进行选择，不再因"中午吃什么"、"晚上吃什么"而烦恼。

> 🍜 **是否每天都为吃什么而苦恼？** 
>
> 🍕 **是否已经厌倦了自己做选择？**
>
> 🍲 **是否想要一种有趣的方式来决定餐食？**

如果你有以上任何一个问题，那么"今天吃什么"就是为你量身打造的！

## ✨ 核心功能

- **随机选择** - 基于您的菜品库随机推荐美食
- **菜单管理** - 添加、编辑和删除您喜爱的菜品
- **精美动画** - 丰富的交互和选择动画效果
- **数据统计** - 追踪您的选择历史和偏好
- **多主题支持** - 可自定义界面主题和动画风格
- **响应式设计** - 完美适配手机、平板和桌面设备

## 🛠️ 技术栈

- **HTML5** - 现代语义化标记
- **CSS3/TailwindCSS** - 响应式设计与精美样式
- **JavaScript** - 交互与动画实现
- **LocalStorage** - 本地数据持久化
- **渐进式Web应用(PWA)** - 支持离线使用与设备安装

## 📂 项目结构
today-eat/
├── index.html # 主页面
├── result.html # 结果展示页面
├── manage.html # 菜品管理页面
├── guide.html # 用户引导页面
├── stats.html # 数据统计页面
├── css/
│ ├── main.css # 主样式
│ ├── animations.css # 动画效果
│ └── ripple.css # 水波纹效果
├── js/
│ ├── app.js # 主应用逻辑
│ ├── foodManager.js # 菜品管理模块
│ ├── animations.js # 动画控制
│ └── stats.js # 数据统计逻辑
├── assets/
│ ├── images/ # 图片资源
│ ├── icons/ # 图标资源
│ └── sounds/ # 音效资源
└── screenshots/ # 应用截图


## 🚀 快速开始

### 在线体验

访问我们的在线演示: [https://yourusername.github.io/what-to-eat](https://yourusername.github.io/what-to-eat)

### 本地安装

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/what-to-eat.git
   cd what-to-eat
   ```

2. 打开应用
   - 使用本地服务器或直接在浏览器中打开`index.html`
   - 建议使用 Live Server 扩展或 Python 的 SimpleHTTPServer

   ```bash
   # 如果安装了Python
   python -m http.server 8000
   ```

3. 开始使用
   - 添加您喜欢的菜品到菜单中
   - 点击随机按钮选择今天吃什么

## 📸 界面展示

<div align="center">
  <img src="screenshots/home.png" alt="主页面" width="200">
  <img src="screenshots/result.png" alt="结果页面" width="200">
  <img src="screenshots/manage.png" alt="管理页面" width="200">
  <img src="screenshots/stats.png" alt="统计页面" width="200">
</div>

## 🎨 设计理念

"今天吃什么"应用采用了现代、简洁的设计语言，以下是我们的设计理念:

- **简约与实用性平衡** - 美观的界面不牺牲功能性
- **愉悦的交互体验** - 流畅的动画和反馈使选择食物变得有趣
- **减轻决策疲劳** - 帮助用户轻松做出决定
- **高度可定制** - 用户可以根据自己的偏好进行调整

## 💡 特色亮点

### 精美动画效果

- 旋转轮盘动画
- 结果展示动画
- 按钮点击水波纹效果
- 页面过渡动画

### 智能随机算法

根据用户历史选择和偏好，智能调整随机推荐，避免短期内重复推荐相同菜品。

### 完全离线支持

作为PWA应用，可以完全离线使用，且可以安装到设备主屏幕。

## 🤝 贡献指南

我们欢迎任何形式的贡献，包括但不限于:

- 报告问题或提出功能建议
- 提交代码改进或新功能
- 改进文档或翻译

请遵循以下步骤:

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 📮 联系我们

如有任何问题或建议，请通过以下方式联系我们:

- GitHub Issues: [https://github.com/xiaotian-freedom/what-to-eat/issues](https://github.com/xiaotian-freedom/what-to-eat/issues)
- 电子邮件: love990963457@gmail.com

---

<div align="center">
  <p>用❤️制作</p>
  <p>© 2023 今天吃什么团队</p>
</div>