#!/bin/bash

# What To Eat 项目文件上传脚本
# 用于将本地项目文件推送到服务器

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
DEFAULT_SERVER="root@your-server-ip"
DEFAULT_REMOTE_PATH="/opt/what-to-eat"
DEFAULT_LOCAL_PATH="."

# 配置文件
CONFIG_FILE=".deploy-config"

# 加载配置
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        log_info "加载配置文件: $CONFIG_FILE"
        source "$CONFIG_FILE"
    else
        log_warning "配置文件不存在，使用默认配置"
        SERVER="$DEFAULT_SERVER"
        REMOTE_PATH="$DEFAULT_REMOTE_PATH"
        LOCAL_PATH="$DEFAULT_LOCAL_PATH"
    fi
}

# 创建配置文件
create_config() {
    log_info "创建配置文件..."
    
    echo "请输入服务器信息："
    read -p "服务器地址 (格式: user@ip): " SERVER
    read -p "远程路径 (默认: /opt/what-to-eat): " REMOTE_PATH
    read -p "本地路径 (默认: 当前目录): " LOCAL_PATH
    
    # 设置默认值
    SERVER=${SERVER:-$DEFAULT_SERVER}
    REMOTE_PATH=${REMOTE_PATH:-$DEFAULT_REMOTE_PATH}
    LOCAL_PATH=${LOCAL_PATH:-$DEFAULT_LOCAL_PATH}
    
    # 保存配置
    cat > "$CONFIG_FILE" << EOF
# What To Eat 部署配置
SERVER="$SERVER"
REMOTE_PATH="$REMOTE_PATH"
LOCAL_PATH="$LOCAL_PATH"
EOF
    
    log_success "配置文件已创建: $CONFIG_FILE"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    # 检查 ssh 和 scp
    if ! command -v ssh &> /dev/null; then
        log_error "ssh 未安装"
        exit 1
    fi
    
    if ! command -v scp &> /dev/null; then
        log_error "scp 未安装"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 测试连接
test_connection() {
    log_info "测试服务器连接..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER" "echo '连接成功'" 2>/dev/null; then
        log_success "服务器连接正常"
        return 0
    else
        log_error "无法连接到服务器: $SERVER"
        log_info "请检查："
        log_info "1. 服务器地址是否正确"
        log_info "2. SSH 密钥是否配置"
        log_info "3. 网络连接是否正常"
        return 1
    fi
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 检查是否在项目目录
    if [[ ! -f "package.json" ]]; then
        log_error "未找到 package.json，请确保在项目根目录运行此脚本"
        exit 1
    fi
    
    # 安装依赖
    log_info "安装依赖..."
    if ! npm ci; then
        log_warning "npm ci 失败，尝试 npm install..."
        npm install
    fi
    
    # 构建项目
    log_info "构建项目..."
    if ! npm run build; then
        log_error "项目构建失败"
        exit 1
    fi
    
    log_success "项目构建完成"
}

# 上传构建产物
upload_dist() {
    log_info "上传构建产物到服务器..."
    
    # 检查构建产物是否存在
    if [[ ! -d "dist" ]]; then
        log_error "构建产物不存在，请先运行构建"
        log_info "运行: $0 build"
        exit 1
    fi
    
    # 创建远程目录
    log_info "创建远程目录..."
    ssh "$SERVER" "mkdir -p $REMOTE_PATH"
    
    # 清理远程 dist 目录
    log_info "清理远程构建产物..."
    ssh "$SERVER" "rm -rf $REMOTE_PATH/dist"
    
    # 上传 dist 目录
    log_info "上传构建产物..."
    scp -r "dist" "$SERVER:$REMOTE_PATH/"
    
    # 上传 Nginx 配置脚本
    if [[ -f "setup-nginx.sh" ]]; then
        log_info "上传 Nginx 配置脚本..."
        scp "setup-nginx.sh" "$SERVER:$REMOTE_PATH/"
    else
        log_warning "未找到 setup-nginx.sh，请确保脚本存在"
    fi
    
    log_success "构建产物上传完成"
}



# 远程部署
remote_deploy() {
    log_info "在服务器上执行部署..."
    
    # 检查服务器上是否有 Nginx 配置脚本
    if ssh "$SERVER" "test -f $REMOTE_PATH/setup-nginx.sh"; then
        log_info "发现 Nginx 配置脚本，执行配置..."
        log_info "注意：此步骤需要 root 权限，可能需要输入密码"
        ssh "$SERVER" "cd $REMOTE_PATH && chmod +x setup-nginx.sh && sudo ./setup-nginx.sh all"
    else
        log_warning "未发现 Nginx 配置脚本"
        log_info "请手动在服务器上运行以下命令："
        log_info "1. 上传 setup-nginx.sh 到服务器"
        log_info "2. 运行: sudo ./setup-nginx.sh all"
        log_info ""
        log_info "或者，您可以："
        log_info "1. 手动配置 Nginx 指向 $REMOTE_PATH/dist"
        log_info "2. 重启 Nginx: sudo systemctl restart nginx"
    fi
}

# 显示帮助
show_help() {
    echo "What To Eat 项目文件上传脚本 (使用 SCP)"
echo "========================================="
    echo
    echo "用法: $0 [选项]"
    echo
    echo "选项:"
    echo "  init          创建配置文件"
    echo "  test          测试服务器连接"
    echo "  build         构建项目"
    echo "  upload        上传构建产物"
    echo "  deploy        远程部署"
    echo "  all           执行完整流程 (build + upload + deploy)"
    echo "  help          显示此帮助信息"
    echo
    echo "示例:"
    echo "  $0 init        # 首次使用，创建配置"
    echo "  $0 all         # 构建并部署整个项目"
    echo "  $0 upload      # 仅上传构建产物"
    echo
}

# 主函数
main() {
    case "${1:-help}" in
        "init")
            create_config
            ;;
        "test")
            load_config
            check_dependencies
            test_connection
            ;;
        "build")
            build_project
            ;;
        "upload")
            load_config
            check_dependencies
            test_connection
            upload_dist
            ;;
        "deploy")
            load_config
            check_dependencies
            test_connection
            remote_deploy
            ;;
        "all")
            load_config
            check_dependencies
            test_connection
            build_project
            upload_dist
            remote_deploy
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 运行主函数
main "$@"
