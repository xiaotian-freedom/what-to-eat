# Docker 部署指南

## 📋 前置要求

- Docker (版本 20.10+)
- Docker Compose (版本 2.0+)

## 🚀 快速部署

### 方法一：使用部署脚本（推荐）

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 方法二：手动部署

```bash
# 1. 构建并启动服务
docker-compose up -d --build

# 2. 查看服务状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f what-to-eat
```

## 🔧 配置说明

### 端口配置

默认端口为 80，如需修改，请编辑 `docker-compose.yml` 文件：

```yaml
ports:
  - '你的端口:80'
```

### 环境变量

可以在 `docker-compose.yml` 中添加环境变量：

```yaml
environment:
  - NODE_ENV=production
  - API_BASE_URL=https://your-api-domain.com
```

### Nginx 配置

如需修改 Nginx 配置，请编辑 `nginx.conf` 文件，然后重新构建镜像。

## 📊 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f what-to-eat

# 进入容器
docker-compose exec what-to-eat sh

# 重新构建镜像
docker-compose build --no-cache

# 查看服务状态
docker-compose ps
```

## 🔍 故障排除

### 1. 端口被占用

如果 80 端口被占用，可以修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - '8080:80' # 使用 8080 端口
```

### 2. 构建失败

检查是否有足够的磁盘空间和内存：

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

### 3. 服务无法访问

检查防火墙设置，确保端口已开放：

```bash
# 检查容器状态
docker-compose ps

# 检查容器日志
docker-compose logs what-to-eat

# 检查端口监听
docker-compose exec what-to-eat netstat -tlnp
```

## 🌐 生产环境部署

### 1. 使用反向代理

建议在生产环境中使用 Nginx 或 Traefik 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. SSL 证书配置

使用 Let's Encrypt 或其他 SSL 证书：

```bash
# 使用 Certbot 获取证书
certbot --nginx -d your-domain.com
```

### 3. 监控和日志

配置日志轮转和监控：

```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/what-to-eat

# 内容示例
/path/to/your/project/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

## 📝 注意事项

1. **数据持久化**：当前配置不包含数据持久化，如需保存数据请配置 volumes
2. **安全配置**：生产环境请修改默认配置，添加安全头
3. **备份策略**：定期备份配置文件和重要数据
4. **更新策略**：使用 CI/CD 自动化部署流程

## 🆘 获取帮助

如果遇到问题，请：

1. 查看容器日志：`docker-compose logs what-to-eat`
2. 检查服务状态：`docker-compose ps`
3. 查看系统资源：`docker stats`
4. 提交 Issue 到项目仓库
