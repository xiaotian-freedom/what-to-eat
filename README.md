# What To Eat - 今天吃什么？

一个帮助你决定今天吃什么的 Vue 3 应用。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 或者
npm start

# 预览构建结果
npm run preview
# 或者
npm run serve

# 构建生产版本
npm run build
```

### 部署到服务器

#### 方法一：使用上传脚本（推荐）

```bash
# 首次配置
./upload-to-server.sh init
# 或者
npm run deploy:init

# 测试连接
npm run deploy:test

# 一键部署
./upload-to-server.sh all
# 或者
npm run deploy

# 仅上传构建产物
npm run deploy:upload
```

#### 方法二：手动部署

1. 构建项目：`npm run build`
2. 将 `dist` 目录上传到服务器
3. 在服务器上配置 Nginx：

   ```bash
   # 上传 setup-nginx.sh 到服务器
   scp setup-nginx.sh user@server:/tmp/

   # 在服务器上运行
   sudo chmod +x /tmp/setup-nginx.sh
   sudo /tmp/setup-nginx.sh all
   ```

## 📁 项目结构

```
├── src/                    # 源代码
│   ├── components/         # Vue 组件
│   ├── views/             # 页面组件
│   ├── stores/            # Pinia 状态管理
│   ├── locales/           # 国际化文件
│   └── assets/            # 静态资源
├── public/                # 公共资源
├── dist/                  # 构建产物
├── upload-to-server.sh    # 文件上传脚本
├── setup-nginx.sh         # Nginx 配置脚本
└── nginx.conf            # Nginx 配置示例
```

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI 组件**: 原生 CSS + 自定义组件
- **国际化**: 自定义 i18n 实现
- **部署**: Nginx + 静态文件托管

## 📝 功能特性

- 🎯 随机选择食物
- 📱 响应式设计
- 🌍 多语言支持
- 💾 本地数据存储
- 🎨 现代化 UI 设计
- ⚡ 快速加载
- 🔐 用户认证系统
- 👤 用户管理功能

## 🔐 认证系统

### 功能特性

- **可选登录**: 登录是可选的，用户可以自由使用应用
- **用户登录**: 支持用户名/密码登录
- **记住我**: 自动保存登录状态
- **快速体验**: 提供演示账户快速登录
- **智能菜单**: 根据登录状态显示不同选项
- **Mock API**: 完整的模拟后端服务

### 演示账户

| 用户名 | 密码     | 角色     |
| ------ | -------- | -------- |
| admin  | admin123 | 管理员   |
| user   | user123  | 普通用户 |
| demo   | demo123  | 演示用户 |

### 技术实现

- **认证服务**: `src/utils/authService.ts` - 完整的认证 API 模拟
- **状态管理**: `src/stores/user.ts` - 用户状态管理
- **可选路由**: `src/router/index.ts` - 登录为可选功能
- **智能菜单**: `src/components/MenuPopover.vue` - 根据登录状态显示不同选项
- **网络请求**: `src/utils/request.ts` - 统一的 HTTP 客户端

### 文件结构

```
src/
├── views/
│   └── LoginPage.vue          # 登录页面
├── stores/
│   └── user.ts               # 用户状态管理
├── utils/
│   ├── authService.ts        # 认证服务
│   └── request.ts           # 网络请求工具
└── router/
    └── index.ts             # 路由配置（含认证守卫）
```

## 🔧 部署脚本

### `upload-to-server.sh`

本地文件上传脚本，用于：

- 本地构建项目
- 上传构建产物到服务器
- 远程部署

### `setup-nginx.sh`

Nginx 配置脚本，用于：

- 安装 Nginx
- 配置静态文件服务
- 设置防火墙规则

## 🚀 完整部署流程

### 步骤 1：本地准备

```bash
# 构建项目
npm run build

# 配置服务器信息
npm run deploy:init
```

### 步骤 2：上传文件

```bash
# 上传构建产物到服务器
npm run deploy:upload
```

### 步骤 3：服务器配置

```bash
# 在服务器上运行（需要 root 权限）
sudo ./setup-nginx.sh all
```

### 步骤 4：验证部署

```bash
# 检查服务状态
npm run nginx:status
```

## �� 许可证

MIT License
