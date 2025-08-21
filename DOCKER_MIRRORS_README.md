# Docker 镜像源配置和检测指南

## 问题背景

在服务器上部署 Docker 应用时，经常会遇到镜像拉取超时的问题：

```
failed to solve: rpc error: code = Unknown desc = failed to solve with frontend dockerfile.v0: failed to create LLB definition: failed to do request: Head https://registry-1.docker.io/v2/library/node/manifests/18-alpine: dial tcp 69.63.184.14:443: i/o timeout
```

这通常是由于网络连接问题或 Docker Hub 访问速度慢导致的。

## 解决方案

### 1. 自动配置镜像源

使用更新后的部署脚本 `server-deploy.sh`，它会自动：

- 检测网络连接状态
- 检查 Docker 镜像源配置
- 自动配置国内镜像源
- 测试镜像拉取速度
- 添加重试机制

### 2. 手动检测镜像源

使用独立的检测脚本 `check-docker-mirrors.sh`：

```bash
# 给脚本添加执行权限
chmod +x check-docker-mirrors.sh

# 运行检测脚本
./check-docker-mirrors.sh
```

## 检测脚本功能

`check-docker-mirrors.sh` 脚本会检测：

1. **Docker 安装状态**

   - 检查 Docker 是否已安装
   - 检查 Docker 服务是否运行

2. **网络连接**

   - 测试基本网络连接（ping 8.8.8.8）
   - 测试 Docker Hub 连接

3. **Docker 配置**

   - 检查 `/etc/docker/daemon.json` 配置文件
   - 显示配置文件内容

4. **镜像源配置**

   - 检查是否配置了镜像源
   - 显示已配置的镜像源列表

5. **性能测试**
   - 测试镜像拉取速度
   - 测试构建速度
   - 显示详细的耗时统计

## 配置的镜像源

脚本会自动配置以下国内镜像源：

- `https://docker.mirrors.ustc.edu.cn` (中科大)
- `https://hub-mirror.c.163.com` (网易)
- `https://mirror.baidubce.com` (百度云)
- `https://registry.docker-cn.com` (Docker 中国)
- `https://dockerhub.azk8s.cn` (Azure 中国)

## 使用方法

### 方法一：使用部署脚本（推荐）

```bash
# 运行部署脚本，会自动配置镜像源
./server-deploy.sh
```

### 方法二：仅检测镜像源

```bash
# 运行检测脚本
./check-docker-mirrors.sh
```

### 方法三：手动配置镜像源

如果只想配置镜像源，可以手动执行：

```bash
# 创建配置目录
sudo mkdir -p /etc/docker

# 配置镜像源
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://registry.docker-cn.com",
    "https://dockerhub.azk8s.cn"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# 重启 Docker 服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info | grep -A 10 "Registry Mirrors"
```

## 验证镜像源是否生效

### 1. 查看 Docker 信息

```bash
docker info | grep -A 10 "Registry Mirrors"
```

如果看到镜像源列表，说明配置生效。

### 2. 测试拉取速度

```bash
# 测试拉取一个小镜像
time docker pull hello-world:latest
```

### 3. 查看拉取日志

```bash
# 拉取时显示详细信息
docker pull alpine:latest --progress=plain
```

## 常见问题

### Q: 配置镜像源后仍然很慢？

A: 可能的原因：

1. 网络环境问题
2. 镜像源服务器故障
3. 防火墙阻止

建议：

- 尝试不同的镜像源
- 检查网络连接
- 使用 `check-docker-mirrors.sh` 脚本诊断

### Q: 如何知道使用的是哪个镜像源？

A: Docker 会按配置顺序尝试镜像源，直到成功。可以通过以下方式查看：

```bash
docker pull alpine:latest --progress=plain
```

### Q: 配置镜像源后需要重启 Docker 吗？

A: 是的，修改 `/etc/docker/daemon.json` 后需要重启 Docker 服务：

```bash
sudo systemctl restart docker
```

## 性能优化建议

1. **选择合适的镜像源**：根据地理位置选择最近的镜像源
2. **定期更新镜像源**：删除不稳定的镜像源
3. **使用多阶段构建**：减少镜像大小
4. **合理使用缓存**：避免重复下载

## 故障排除

如果遇到问题，可以：

1. 运行检测脚本查看详细信息
2. 检查 Docker 日志：`sudo journalctl -u docker`
3. 检查网络连接：`ping 8.8.8.8`
4. 尝试直接访问镜像源网站
