# 🚀 What To Eat 项目部署指南

## 📋 项目概述

What To Eat 是一个基于 Vue 3 + Vite + TypeScript 的前端项目，使用 Docker 容器化部署。

## 🛠️ 部署方式

### 方式一：本地 Docker 部署

```bash
# 1. 构建并启动服务
npm run docker:build
npm run docker:up

# 2. 查看服务状态
npm run docker:logs

# 3. 访问应用
# 本地访问: http://localhost
```

### 方式二：云服务器部署

#### 1. 上传项目到服务器

```bash
# 上传项目文件
npm run server:upload user@your-server-ip

# 示例
npm run server:upload root@47.122.112.197
```

#### 2. 在服务器上部署

```bash
# 连接到服务器
ssh user@your-server-ip

# 进入项目目录
cd /opt/what-to-eat

# 运行部署脚本
./server-deploy.sh
```

## 📁 项目结构

```
What-To-Eat/
├── src/                    # 源代码
├── public/                 # 静态资源
├── Dockerfile              # Docker 构建文件
├── docker-compose.yml      # Docker 编排配置
├── nginx.conf              # Nginx 配置
├── server-deploy.sh        # 服务器部署脚本
├── upload-to-server.sh     # 项目上传脚本
├── SERVER_DEPLOY_README.md # 详细部署文档
└── DOCKER_README.md        # Docker 部署说明
```

## 🔧 核心文件说明

### Dockerfile

- 多阶段构建：Node.js 构建 + Nginx 部署
- 优化镜像大小和构建效率

### docker-compose.yml

- 容器编排配置
- 端口映射：80:80
- 健康检查和自动重启

### nginx.conf

- 支持 SPA 路由
- Gzip 压缩
- 安全头配置
- 静态资源缓存

### server-deploy.sh

- 自动化服务器部署脚本
- 支持 Ubuntu/CentOS/Alibaba Cloud Linux
- 自动安装 Docker 和 Docker Compose
- 配置防火墙和系统服务

## 🚀 快速开始

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 2. 本地 Docker 部署

```bash
# 构建镜像
npm run docker:build

# 启动服务
npm run docker:up

# 查看日志
npm run docker:logs

# 停止服务
npm run docker:down
```

### 3. 服务器部署

```bash
# 上传项目
npm run server:upload root@your-server-ip

# 在服务器上部署
ssh root@your-server-ip
cd /opt/what-to-eat
./server-deploy.sh
```

## 📊 管理命令

### Docker 管理

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f what-to-eat

# 重启服务
docker-compose restart

# 重新构建
docker-compose build --no-cache
```

### 系统服务管理

```bash
# 启动服务
sudo systemctl start what-to-eat

# 停止服务
sudo systemctl stop what-to-eat

# 查看状态
sudo systemctl status what-to-eat

# 查看日志
sudo journalctl -u what-to-eat -f
```

## 🔍 故障排除

### 1. 构建失败

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

### 2. 服务无法启动

```bash
# 检查容器状态
docker-compose ps

# 查看详细日志
docker-compose logs what-to-eat

# 检查端口占用
netstat -tlnp | grep :80
```

### 3. 无法访问网站

```bash
# 检查服务状态
curl -I http://localhost:80

# 检查防火墙
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-ports  # CentOS
```

## 🔒 安全配置

### 1. 防火墙设置

```bash
# Ubuntu
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### 2. SSL 证书配置

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

## 📝 环境要求

### 服务器要求

- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Alibaba Cloud Linux
- **内存**: 1GB+ RAM
- **存储**: 10GB+ 可用空间
- **网络**: 公网 IP

### 软件要求

- Docker 20.10+
- Docker Compose 2.0+
- Nginx (可选，用于反向代理)

## 🎯 部署检查清单

- [ ] 项目文件已上传到服务器
- [ ] Docker 和 Docker Compose 已安装
- [ ] 防火墙已配置
- [ ] 应用已部署并运行
- [ ] 域名解析已配置（如果有域名）
- [ ] SSL 证书已配置（如果有域名）
- [ ] 系统服务已创建
- [ ] 应用可以正常访问

## 📞 获取帮助

如果遇到问题：

1. **查看日志**: `docker-compose logs -f`
2. **检查状态**: `docker-compose ps`
3. **重启服务**: `docker-compose restart`
4. **重新部署**: `./server-deploy.sh`

## 📚 相关文档

- `SERVER_DEPLOY_README.md` - 详细服务器部署文档
- `DOCKER_README.md` - Docker 部署说明

---

**完成以上步骤后，你的 What To Eat 应用就成功部署了！** 🎉
