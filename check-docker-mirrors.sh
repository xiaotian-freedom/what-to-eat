#!/bin/bash

# Docker 镜像源检测脚本
# 用于检测 Docker 镜像源配置是否生效

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

# 检查 Docker 是否安装
check_docker_installed() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行或权限不足"
        return 1
    fi
    
    log_success "Docker 已安装并运行"
    return 0
}

# 检查网络连接
check_network() {
    log_info "检查网络连接..."
    
    # 测试基本网络连接
    if ping -c 1 8.8.8.8 &> /dev/null; then
        log_success "基本网络连接正常"
    else
        log_error "基本网络连接失败"
        return 1
    fi
    
    # 测试 Docker Hub 连接
    if curl -s --connect-timeout 10 https://registry-1.docker.io/v2/ &> /dev/null; then
        log_success "Docker Hub 连接正常"
    else
        log_warning "Docker Hub 连接失败，需要配置镜像源"
        return 1
    fi
    
    return 0
}

# 检查 Docker 配置文件
check_docker_config() {
    log_info "检查 Docker 配置文件..."
    
    if [[ ! -f /etc/docker/daemon.json ]]; then
        log_warning "Docker 配置文件不存在: /etc/docker/daemon.json"
        return 1
    fi
    
    log_success "Docker 配置文件存在"
    
    # 显示配置文件内容
    echo "配置文件内容:"
    cat /etc/docker/daemon.json | jq . 2>/dev/null || cat /etc/docker/daemon.json
    echo
    
    return 0
}

# 检查镜像源配置
check_mirrors_config() {
    log_info "检查镜像源配置..."
    
    if docker info | grep -q "Registry Mirrors"; then
        log_success "检测到镜像源配置"
        echo "已配置的镜像源:"
        docker info | grep -A 10 "Registry Mirrors"
    else
        log_warning "未检测到镜像源配置"
        return 1
    fi
    
    return 0
}

# 测试镜像拉取速度
test_image_pull_speed() {
    log_info "测试镜像拉取速度..."
    
    local test_images=("hello-world:latest" "alpine:latest" "nginx:alpine")
    local results=()
    
    for image in "${test_images[@]}"; do
        log_info "测试拉取镜像: $image"
        
        # 记录开始时间
        local start_time=$(date +%s)
        
        # 拉取镜像
        if timeout 120 docker pull $image &> /dev/null; then
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            results+=("$image: ${duration}秒")
            log_success "$image 拉取成功，耗时 ${duration}秒"
            
            # 清理镜像
            docker rmi $image &> /dev/null || true
        else
            results+=("$image: 失败")
            log_error "$image 拉取失败"
        fi
    done
    
    echo
    log_info "拉取速度测试结果:"
    for result in "${results[@]}"; do
        echo "  - $result"
    done
}

# 测试构建速度
test_build_speed() {
    log_info "测试构建速度..."
    
    # 创建临时测试目录
    local test_dir="/tmp/docker-test-$$"
    mkdir -p "$test_dir"
    cd "$test_dir"
    
    # 创建简单的 Dockerfile
    cat > Dockerfile << 'EOF'
FROM alpine:latest
RUN echo "Hello from test build" > /test.txt
CMD ["cat", "/test.txt"]
EOF
    
    # 记录开始时间
    local start_time=$(date +%s)
    
    # 构建镜像
    if timeout 300 docker build -t test-build . &> /dev/null; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_success "构建测试成功，耗时 ${duration}秒"
    else
        log_error "构建测试失败"
    fi
    
    # 清理
    docker rmi test-build &> /dev/null || true
    cd /
    rm -rf "$test_dir"
}

# 显示 Docker 信息
show_docker_info() {
    log_info "Docker 系统信息:"
    echo "Docker 版本: $(docker --version)"
    echo "Docker Compose 版本: $(docker-compose --version 2>/dev/null || echo '未安装')"
    echo "Docker 根目录: $(docker info | grep 'Docker Root Dir' | awk '{print $4}')"
    echo "存储驱动: $(docker info | grep 'Storage Driver' | awk '{print $3}')"
    echo
}

# 主函数
main() {
    echo "🔍 Docker 镜像源检测脚本"
    echo "========================"
    echo
    
    # 检查 Docker 安装
    if ! check_docker_installed; then
        exit 1
    fi
    
    # 显示 Docker 信息
    show_docker_info
    
    # 检查网络连接
    check_network
    
    # 检查 Docker 配置
    check_docker_config
    
    # 检查镜像源配置
    check_mirrors_config
    
    # 测试镜像拉取速度
    test_image_pull_speed
    
    # 测试构建速度
    test_build_speed
    
    echo
    log_success "检测完成！"
    
    # 给出建议
    echo
    log_info "建议:"
    if docker info | grep -q "Registry Mirrors"; then
        echo "  ✅ 镜像源已配置，Docker 拉取和构建应该比较快"
    else
        echo "  ⚠️  建议配置镜像源以提高拉取速度"
        echo "  可以运行部署脚本自动配置镜像源"
    fi
}

# 运行主函数
main "$@"
