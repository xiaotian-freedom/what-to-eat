#!/bin/bash

# What To Eat 项目服务器部署脚本
# 适用于 Ubuntu/CentOS 等 Linux 服务器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查网络连接
check_network() {
    log_info "检查网络连接..."
    
    # 测试基本网络连接
    if ! ping -c 1 8.8.8.8 &> /dev/null; then
        log_error "无法连接到外网，请检查网络配置"
        return 1
    fi
    
    # 测试 Docker Hub 连接
    if ! curl -s --connect-timeout 10 https://registry-1.docker.io/v2/ &> /dev/null; then
        log_warning "无法直接连接 Docker Hub，将使用镜像源"
        return 1
    fi
    
    log_success "网络连接正常"
    return 0
}

# 检测 Docker 镜像源配置
check_docker_mirrors() {
    log_info "检测 Docker 镜像源配置..."
    
    if [[ ! -f /etc/docker/daemon.json ]]; then
        log_warning "未检测到 Docker 镜像源配置"
        return 1
    fi
    
    if grep -q "registry-mirrors" /etc/docker/daemon.json; then
        log_success "检测到 Docker 镜像源配置"
        return 0
    else
        log_warning "Docker 配置文件存在但未配置镜像源"
        return 1
    fi
}

# 配置 Docker 镜像源
configure_docker_mirrors() {
    log_info "配置 Docker 镜像源..."
    
    # 创建 Docker 配置目录
    sudo mkdir -p /etc/docker
    
    # 备份现有配置
    if [[ -f /etc/docker/daemon.json ]]; then
        sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup
        log_info "已备份现有 Docker 配置"
    fi
    
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
    
    log_success "Docker 镜像源配置完成"
    
    # 重启 Docker 服务
    log_info "重启 Docker 服务..."
    sudo systemctl daemon-reload
    sudo systemctl restart docker
    
    # 等待 Docker 服务启动
    sleep 5
    
    # 验证配置
    if docker info | grep -q "Registry Mirrors"; then
        log_success "Docker 镜像源配置生效"
        docker info | grep -A 10 "Registry Mirrors"
    else
        log_warning "Docker 镜像源配置可能未生效"
    fi
}

# 测试镜像拉取
test_image_pull() {
    log_info "测试镜像拉取..."
    
    local test_image="hello-world:latest"
    local max_retries=3
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        log_info "尝试拉取测试镜像 (第 $((retry_count + 1)) 次)..."
        
        if timeout 60 docker pull $test_image; then
            log_success "镜像拉取成功"
            docker rmi $test_image &> /dev/null || true
            return 0
        else
            retry_count=$((retry_count + 1))
            log_warning "镜像拉取失败 (第 $retry_count 次)"
            
            if [[ $retry_count -lt $max_retries ]]; then
                log_info "等待 10 秒后重试..."
                sleep 10
            fi
        fi
    done
    
    log_error "镜像拉取失败，请检查网络连接和镜像源配置"
    return 1
}

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "检测到 root 用户，建议使用普通用户运行此脚本"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 检测操作系统
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi
    log_info "检测到操作系统: $OS $VER"
}

# 安装 Docker (Ubuntu/Debian)
install_docker_ubuntu() {
    log_info "安装 Docker (Ubuntu/Debian)..."
    
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
    
    log_success "Docker 安装完成"
}

# 安装 Docker (CentOS/RHEL)
install_docker_centos() {
    log_info "安装 Docker (CentOS/RHEL)..."
    
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
    
    log_success "Docker 安装完成"
}

# 安装 Docker Compose
install_docker_compose() {
    log_info "安装 Docker Compose..."
    
    # 下载 Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # 添加执行权限
    sudo chmod +x /usr/local/bin/docker-compose
    
    # 创建软链接
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose 安装完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    # 检测防火墙类型
    if command -v ufw &> /dev/null; then
        # Ubuntu UFW
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw allow 22/tcp
        log_success "UFW 防火墙配置完成"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS firewalld
        if systemctl is-active --quiet firewalld; then
            sudo firewall-cmd --permanent --add-port=80/tcp
            sudo firewall-cmd --permanent --add-port=443/tcp
            sudo firewall-cmd --permanent --add-port=22/tcp
            sudo firewall-cmd --reload
            log_success "firewalld 防火墙配置完成"
        else
            log_warning "FirewallD 未运行，尝试启动..."
            if sudo systemctl start firewalld 2>/dev/null; then
                sudo systemctl enable firewalld
                sudo firewall-cmd --permanent --add-port=80/tcp
                sudo firewall-cmd --permanent --add-port=443/tcp
                sudo firewall-cmd --permanent --add-port=22/tcp
                sudo firewall-cmd --reload
                log_success "FirewallD 启动并配置完成"
            else
                log_warning "无法启动 FirewallD，跳过防火墙配置"
                log_info "请确保云服务器安全组已开放端口 80, 443, 22"
            fi
        fi
    else
        log_warning "未检测到防火墙，请手动配置端口 80, 443, 22"
        log_info "请确保云服务器安全组已开放端口 80, 443, 22"
    fi
}

# 创建项目目录
create_project_dir() {
    log_info "创建项目目录..."
    
    PROJECT_DIR="/opt/what-to-eat"
    sudo mkdir -p $PROJECT_DIR
    sudo chown $USER:$USER $PROJECT_DIR
    
    log_success "项目目录创建完成: $PROJECT_DIR"
}

# 复制项目文件
copy_project_files() {
    log_info "复制项目文件..."
    
    PROJECT_DIR="/opt/what-to-eat"
    CURRENT_DIR=$(pwd)
    
    # 复制必要的文件
    cp -r "$CURRENT_DIR"/* "$PROJECT_DIR/"
    
    log_success "项目文件复制完成"
}

# 部署应用
deploy_application() {
    log_info "开始部署应用..."
    
    PROJECT_DIR="/opt/what-to-eat"
    cd $PROJECT_DIR
    
    # 检查是否已有项目文件
    if [[ -f "docker-compose.yml" ]]; then
        log_warning "检测到现有项目，是否重新部署？"
        read -p "这将停止现有服务并重新部署 (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down
        else
            log_info "跳过部署"
            return
        fi
    fi
    
    # 创建日志目录
    mkdir -p logs
    
    # 构建并启动服务（带重试机制）
    log_info "构建 Docker 镜像..."
    local max_retries=3
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        log_info "尝试构建镜像 (第 $((retry_count + 1)) 次)..."
        
        if timeout 300 docker-compose build --no-cache; then
            log_success "Docker 构建成功"
            break
        else
            retry_count=$((retry_count + 1))
            log_warning "Docker 构建失败 (第 $retry_count 次)"
            
            if [[ $retry_count -lt $max_retries ]]; then
                log_info "等待 30 秒后重试..."
                sleep 30
            else
                log_error "Docker 构建失败，尝试使用 podman-compose..."
                if command -v podman-compose &> /dev/null; then
                    podman-compose build --no-cache
                else
                    log_error "构建失败，请检查 Docker 配置和网络连接"
                    exit 1
                fi
            fi
        fi
    done
    
    log_info "启动服务..."
    if ! docker-compose up -d; then
        log_error "服务启动失败"
        docker-compose logs
        exit 1
    fi
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 15
    
    # 检查服务状态
    log_info "检查服务状态..."
    if docker-compose ps | grep -q "Up"; then
        log_success "服务启动成功！"
        
        # 获取服务器 IP
        SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "localhost")
        log_success "应用部署完成！"
        log_success "访问地址: http://$SERVER_IP"
        log_success "本地访问: http://localhost"
        
        # 显示服务状态
        docker-compose ps
    else
        log_error "服务启动失败"
        docker-compose logs
        exit 1
    fi
}

# 配置 Nginx 反向代理（可选）
setup_nginx_proxy() {
    log_info "是否配置 Nginx 反向代理？"
    read -p "这将安装 Nginx 并配置反向代理 (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    # 安装 Nginx
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y nginx
    elif command -v yum &> /dev/null; then
        sudo yum install -y nginx
    fi
    
    # 配置 Nginx
    sudo tee /etc/nginx/sites-available/what-to-eat << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/what-to-eat /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    log_success "Nginx 反向代理配置完成"
}

# 配置 SSL 证书（可选）
setup_ssl() {
    log_info "是否配置 SSL 证书？"
    read -p "这将安装 Certbot 并配置 Let's Encrypt SSL (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    read -p "请输入域名: " DOMAIN
    
    if [[ -z "$DOMAIN" ]]; then
        log_warning "未输入域名，跳过 SSL 配置"
        return
    fi
    
    # 安装 Certbot
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y certbot python3-certbot-nginx
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot python3-certbot-nginx
    fi
    
    # 获取证书
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    log_success "SSL 证书配置完成"
}

# 创建系统服务
create_systemd_service() {
    log_info "创建系统服务..."
    
    sudo tee /etc/systemd/system/what-to-eat.service << EOF
[Unit]
Description=What To Eat Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/what-to-eat
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable what-to-eat.service
    
    log_success "系统服务创建完成"
}

# 显示管理命令
show_management_commands() {
    log_info "常用管理命令："
    echo
    echo "启动服务:   sudo systemctl start what-to-eat"
    echo "停止服务:   sudo systemctl stop what-to-eat"
    echo "重启服务:   sudo systemctl restart what-to-eat"
    echo "查看状态:   sudo systemctl status what-to-eat"
    echo "查看日志:   docker-compose logs -f"
    echo "进入容器:   docker-compose exec what-to-eat sh"
    echo "更新应用:   cd /opt/what-to-eat && git pull && docker-compose up -d --build"
    echo
}

# 主函数
main() {
    echo "🚀 What To Eat 项目服务器部署脚本"
    echo "=================================="
    echo
    
    # 检查 root 用户
    check_root
    
    # 检测操作系统
    detect_os
    
    # 检查网络连接
    if ! check_network; then
        log_warning "网络连接异常，继续尝试部署..."
    fi
    
    # 安装 Docker
    if ! command -v docker &> /dev/null; then
        if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
            install_docker_ubuntu
        elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Alibaba Cloud Linux"* ]]; then
            install_docker_centos
        else
            log_error "不支持的操作系统: $OS"
            log_info "尝试使用 CentOS 方式安装 Docker..."
            install_docker_centos
        fi
    else
        log_success "Docker 已安装"
    fi
    
    # 安装 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        install_docker_compose
    else
        log_success "Docker Compose 已安装"
    fi
    
    # 检查并配置 Docker 镜像源
    if ! check_docker_mirrors; then
        configure_docker_mirrors
    fi
    
    # 测试镜像拉取
    if ! test_image_pull; then
        log_warning "镜像拉取测试失败，但继续部署..."
    fi
    
    # 配置防火墙
    configure_firewall
    
    # 创建项目目录
    create_project_dir
    
    # 复制项目文件
    copy_project_files
    
    # 部署应用
    deploy_application
    
    # 配置 Nginx 反向代理
    setup_nginx_proxy
    
    # 配置 SSL 证书
    setup_ssl
    
    # 创建系统服务
    create_systemd_service
    
    # 显示管理命令
    show_management_commands
    
    log_success "部署完成！"
    log_warning "请重新登录以应用 docker 组权限"
}

# 运行主函数
main "$@"
