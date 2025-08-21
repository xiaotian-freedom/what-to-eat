# 🚀 云服务器部署指南

## 📋 前置准备

### 1. 服务器要求

- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **内存**: 至少 1GB RAM
- **存储**: 至少 10GB 可用空间
- **网络**: 公网 IP 地址
- **端口**: 80, 443 (HTTP/HTTPS)

### 2. 域名准备（可选）

- 如果有域名，建议提前准备好
- 域名需要解析到服务器 IP

## 🛠️ 部署方式

### 方式一：一键部署（推荐）

#### 1. 上传项目文件到服务器

```bash
# 方法1: 使用 scp 上传
scp -r ./What-To-Eat user@your-server-ip:/tmp/

# 方法2: 使用 rsync 上传
rsync -avz ./What-To-Eat user@your-server-ip:/tmp/

# 方法3: 使用 Git 克隆（如果项目在 Git 仓库）
ssh user@your-server-ip
cd /tmp
git clone https://github.com/your-username/What-To-Eat.git
```

#### 2. 运行部署脚本

```bash
# 连接到服务器
ssh user@your-server-ip

# 进入项目目录
cd /tmp/What-To-Eat

# 给脚本执行权限
chmod +x server-deploy.sh

# 运行部署脚本
./server-deploy.sh
```

#### 3. 按照提示完成配置

脚本会自动：

- ✅ 检测操作系统
- ✅ 安装 Docker 和 Docker Compose
- ✅ 配置防火墙
- ✅ 部署应用
- ✅ 配置 Nginx 反向代理（可选）
- ✅ 配置 SSL 证书（可选）
- ✅ 创建系统服务

### 方式二：手动部署

#### 1. 安装 Docker

**Ubuntu/Debian:**

```bash
# 更新包索引
sudo apt-get update

# 安装必要的包
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**

```bash
# 安装必要的包
sudo yum install -y yum-utils

# 设置仓库
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker Engine
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER
```

#### 2. 安装 Docker Compose

```bash
# 下载 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 创建软链接
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
```

#### 3. 配置防火墙

**Ubuntu (UFW):**

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
```

**CentOS (firewalld):**

```bash
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload
```

#### 4. 部署应用

```bash
# 创建项目目录
sudo mkdir -p /opt/what-to-eat
sudo chown $USER:$USER /opt/what-to-eat

# 复制项目文件
cp -r /tmp/What-To-Eat/* /opt/what-to-eat/

# 进入项目目录
cd /opt/what-to-eat

# 创建日志目录
mkdir -p logs

# 构建并启动服务
docker-compose build --no-cache
docker-compose up -d

# 检查服务状态
docker-compose ps
```

## 🔧 配置说明

### 1. 端口配置

默认端口为 80，如需修改：

```yaml
# docker-compose.yml
ports:
  - '8080:80' # 修改为 8080 端口
```

### 2. 环境变量

可以在 `docker-compose.yml` 中添加环境变量：

```yaml
environment:
  - NODE_ENV=production
  - API_BASE_URL=https://your-api-domain.com
```

### 3. 域名和 SSL 配置

如果有域名，建议配置 SSL 证书：

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

## 📊 管理命令

### 系统服务管理

```bash
# 启动服务
sudo systemctl start what-to-eat

# 停止服务
sudo systemctl stop what-to-eat

# 重启服务
sudo systemctl restart what-to-eat

# 查看状态
sudo systemctl status what-to-eat

# 查看日志
sudo journalctl -u what-to-eat -f
```

### Docker 管理

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f what-to-eat

# 进入容器
docker-compose exec what-to-eat sh

# 重启容器
docker-compose restart

# 停止服务
docker-compose down

# 重新构建
docker-compose build --no-cache
```

### 应用更新

```bash
# 进入项目目录
cd /opt/what-to-eat

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 🔍 故障排除

### 1. 服务无法启动

```bash
# 检查容器状态
docker-compose ps

# 查看详细日志
docker-compose logs what-to-eat

# 检查端口占用
sudo netstat -tlnp | grep :80

# 检查防火墙
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-ports  # CentOS
```

### 2. 无法访问网站

```bash
# 检查服务状态
curl -I http://localhost:80

# 检查服务器 IP
curl ifconfig.me

# 检查域名解析
nslookup your-domain.com

# 检查 SSL 证书
openssl s_client -connect your-domain.com:443
```

### 3. 性能问题

```bash
# 查看系统资源
htop
df -h
free -h

# 查看 Docker 资源使用
docker stats

# 清理 Docker 缓存
docker system prune -a
```

## 🔒 安全建议

### 1. 防火墙配置

```bash
# 只开放必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 定期更新

```bash
# 更新系统
sudo apt-get update && sudo apt-get upgrade  # Ubuntu
sudo yum update  # CentOS

# 更新 Docker
sudo apt-get upgrade docker-ce  # Ubuntu
sudo yum update docker-ce  # CentOS
```

### 3. 备份策略

```bash
# 备份项目文件
tar -czf what-to-eat-backup-$(date +%Y%m%d).tar.gz /opt/what-to-eat

# 备份 Docker 镜像
docker save what-to-eat-what-to-eat:latest > what-to-eat-image.tar
```

## 📞 获取帮助

如果遇到问题：

1. **查看日志**: `docker-compose logs -f`
2. **检查状态**: `docker-compose ps`
3. **重启服务**: `docker-compose restart`
4. **重新部署**: `./server-deploy.sh`

## 🎯 部署检查清单

- [ ] 服务器满足最低要求
- [ ] 项目文件已上传到服务器
- [ ] Docker 和 Docker Compose 已安装
- [ ] 防火墙已配置
- [ ] 应用已部署并运行
- [ ] 域名解析已配置（如果有域名）
- [ ] SSL 证书已配置（如果有域名）
- [ ] 系统服务已创建
- [ ] 应用可以正常访问
- [ ] 日志监控已配置

完成以上步骤后，你的 What To Eat 应用就成功部署到云服务器了！🎉
