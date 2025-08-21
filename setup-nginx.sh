#!/bin/bash

# Nginx 配置脚本
# 用于配置 Nginx 服务静态文件

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

# 默认配置
DEFAULT_SITE_PATH="/opt/what-to-eat/dist"
DEFAULT_DOMAIN="localhost"

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限运行"
        log_info "请使用: sudo $0"
        exit 1
    fi
}

# 安装 Nginx
install_nginx() {
    log_info "检查 Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_success "Nginx 已安装"
        return 0
    fi
    
    log_info "安装 Nginx..."
    
    if command -v apt-get &> /dev/null; then
        # Ubuntu/Debian
        apt-get update
        apt-get install -y nginx
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        log_info "检测到 yum 包管理器，尝试安装 Nginx..."
        
        # 首先尝试直接安装
        if yum install -y nginx; then
            log_success "Nginx 安装成功"
        else
            log_warning "直接安装失败，尝试启用 EPEL 仓库..."
            
            # 尝试安装 EPEL 仓库
            if yum install -y epel-release --allowerasing; then
                yum update
                if yum install -y nginx; then
                    log_success "通过 EPEL 仓库安装 Nginx 成功"
                else
                    log_warning "EPEL 安装失败，尝试其他方法..."
                    
                    # 尝试使用 --nobest 选项
                    if yum install -y nginx --nobest; then
                        log_success "使用 --nobest 选项安装 Nginx 成功"
                    else
                        log_warning "yum 安装失败，尝试手动下载安装..."
                        
                        # 尝试手动下载安装
                        if command -v wget &> /dev/null; then
                            log_info "尝试手动下载 Nginx..."
                            cd /tmp
                            if wget http://nginx.org/packages/centos/8/x86_64/RPMS/nginx-1.20.2-1.el8.ngx.x86_64.rpm; then
                                # 安装依赖
                                yum install -y openssl pcre zlib
                                if rpm -ivh nginx-1.20.2-1.el8.ngx.x86_64.rpm; then
                                    log_success "手动安装 Nginx 成功"
                                    rm -f nginx-1.20.2-1.el8.ngx.x86_64.rpm
                                else
                                    log_error "手动安装 Nginx 失败"
                                    exit 1
                                fi
                            else
                                log_error "无法下载 Nginx 包"
                                exit 1
                            fi
                        else
                            log_error "无法安装 Nginx，请手动安装"
                            log_info "建议手动执行以下命令："
                            log_info "1. yum install -y epel-release --allowerasing"
                            log_info "2. yum install -y nginx"
                            log_info "3. 或者手动下载安装："
                            log_info "   wget http://nginx.org/packages/centos/8/x86_64/RPMS/nginx-1.20.2-1.el8.ngx.x86_64.rpm"
                            log_info "   rpm -ivh nginx-1.20.2-1.el8.ngx.x86_64.rpm"
                            exit 1
                        fi
                    fi
                fi
            else
                log_warning "EPEL 安装失败，尝试其他方法..."
                
                # 尝试使用 --nobest 选项
                if yum install -y nginx --nobest; then
                    log_success "使用 --nobest 选项安装 Nginx 成功"
                else
                    log_error "无法安装 Nginx，请手动安装"
                    log_info "建议手动执行以下命令："
                    log_info "1. yum install -y epel-release --allowerasing"
                    log_info "2. yum install -y nginx"
                    exit 1
                fi
            fi
        fi
    else
        log_error "不支持的操作系统"
        exit 1
    fi
    
    # 启动并启用 Nginx
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx 安装完成"
}

# 配置 Nginx
configure_nginx() {
    log_info "配置 Nginx..."
    
    # 获取配置参数
    read -p "请输入网站文件路径 (默认: $DEFAULT_SITE_PATH): " SITE_PATH
    SITE_PATH=${SITE_PATH:-$DEFAULT_SITE_PATH}
    
    read -p "请输入域名 (默认: $DEFAULT_DOMAIN): " DOMAIN
    DOMAIN=${DOMAIN:-$DEFAULT_DOMAIN}
    
    # 检查网站文件是否存在
    if [[ ! -d "$SITE_PATH" ]]; then
        log_error "网站文件路径不存在: $SITE_PATH"
        log_info "请确保已上传 dist 文件到服务器"
        exit 1
    fi
    
    # 检测 Nginx 配置目录结构
    if [[ -d "/etc/nginx/sites-available" ]]; then
        # Ubuntu/Debian 风格
        log_info "使用 Ubuntu/Debian 风格配置..."
        
        # 创建站点配置
        cat > /etc/nginx/sites-available/what-to-eat << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $SITE_PATH;
    index index.html;
    
    # 处理 Vue Router 的 history 模式
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 日志
    access_log /var/log/nginx/what-to-eat.access.log;
    error_log /var/log/nginx/what-to-eat.error.log;
}
EOF
        
        # 启用站点
        ln -sf /etc/nginx/sites-available/what-to-eat /etc/nginx/sites-enabled/
        
        # 禁用默认站点
        rm -f /etc/nginx/sites-enabled/default
        
    else
        # CentOS/RHEL 风格
        log_info "使用 CentOS/RHEL 风格配置..."
        
        # 创建站点配置
        cat > /etc/nginx/conf.d/what-to-eat.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $SITE_PATH;
    index index.html;
    
    # 处理 Vue Router 的 history 模式
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 日志
    access_log /var/log/nginx/what-to-eat.access.log;
    error_log /var/log/nginx/what-to-eat.error.log;
}
EOF
    fi
    
    # 测试配置
    if nginx -t; then
        systemctl reload nginx
        log_success "Nginx 配置完成"
    else
        log_error "Nginx 配置测试失败"
        exit 1
    fi
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu UFW
        ufw allow 80/tcp
        ufw allow 443/tcp
        log_success "UFW 防火墙配置完成"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS firewalld
        if systemctl is-active --quiet firewalld; then
            firewall-cmd --permanent --add-port=80/tcp
            firewall-cmd --permanent --add-port=443/tcp
            firewall-cmd --reload
            log_success "firewalld 防火墙配置完成"
        else
            log_warning "FirewallD 未运行，请确保云服务器安全组已开放端口 80, 443"
        fi
    else
        log_warning "未检测到防火墙，请确保云服务器安全组已开放端口 80, 443"
    fi
}

# 显示状态
show_status() {
    log_info "Nginx 服务状态："
    systemctl status nginx --no-pager -l
    
    log_info "网站配置信息："
    echo "网站文件路径: $SITE_PATH"
    echo "域名: $DOMAIN"
    echo "访问地址: http://$DOMAIN"
    
    # 获取服务器 IP
    SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "localhost")
    log_success "也可以通过 IP 访问: http://$SERVER_IP"
}

# 显示帮助
show_help() {
    echo "Nginx 配置脚本"
    echo "==============="
    echo
    echo "用法: $0 [选项]"
    echo
    echo "选项:"
    echo "  install        安装 Nginx"
    echo "  config         配置 Nginx"
    echo "  firewall       配置防火墙"
    echo "  status         显示服务状态"
    echo "  all            执行完整配置"
    echo "  help           显示此帮助信息"
    echo
    echo "示例:"
    echo "  sudo $0 all     # 完整配置"
    echo "  sudo $0 config  # 仅配置 Nginx"
    echo
}

# 主函数
main() {
    case "${1:-help}" in
        "install")
            check_root
            install_nginx
            ;;
        "config")
            check_root
            configure_nginx
            ;;
        "firewall")
            check_root
            configure_firewall
            ;;
        "status")
            show_status
            ;;
        "all")
            check_root
            install_nginx
            configure_nginx
            configure_firewall
            show_status
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 运行主函数
main "$@"
