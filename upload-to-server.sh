#!/bin/bash

# What To Eat 项目上传脚本
# 用于将项目文件上传到云服务器

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

# 检查参数
if [[ $# -lt 1 ]]; then
    echo "用法: $0 <用户名@服务器IP> [SSH密钥路径] [项目目录]"
    echo "示例: $0 user@192.168.1.100"
    echo "示例: $0 user@your-domain.com ~/.ssh/id_rsa"
    echo "示例: $0 user@your-domain.com ~/.ssh/id_rsa /path/to/project"
    echo ""
    echo "如果未指定项目目录，将使用当前目录"
    echo "如果未指定SSH密钥，将使用默认密钥"
    exit 1
fi

SERVER=$1
SSH_KEY=${2:-""}
PROJECT_DIR=${3:-$(pwd)}

# 构建 SSH 命令
if [[ -n "$SSH_KEY" ]]; then
    SSH_CMD="ssh -i $SSH_KEY"
    SCP_CMD="scp -i $SSH_KEY"
    RSYNC_CMD="rsync -avz -e 'ssh -i $SSH_KEY'"
else
    SSH_CMD="ssh"
    SCP_CMD="scp"
    RSYNC_CMD="rsync -avz"
fi

# 检查项目目录是否存在
if [[ ! -d "$PROJECT_DIR" ]]; then
    log_error "项目目录不存在: $PROJECT_DIR"
    exit 1
fi

# 检查必要的文件是否存在
if [[ ! -f "$PROJECT_DIR/Dockerfile" ]] || [[ ! -f "$PROJECT_DIR/docker-compose.yml" ]]; then
    log_error "项目目录中缺少必要的 Docker 文件"
    log_error "请确保在正确的项目目录中运行此脚本"
    exit 1
fi

log_info "开始上传项目到服务器..."
log_info "服务器: $SERVER"
log_info "项目目录: $PROJECT_DIR"

# 创建项目目录
PROJECT_DIR_ON_SERVER="/opt/what-to-eat"
log_info "在服务器上创建项目目录: $PROJECT_DIR_ON_SERVER"

# 在服务器上创建目录
$SSH_CMD "$SERVER" "sudo mkdir -p $PROJECT_DIR_ON_SERVER && sudo chown \$USER:\$USER $PROJECT_DIR_ON_SERVER"

# 上传项目文件
log_info "上传项目文件到服务器..."

# 使用 scp 上传（服务器可能没有 rsync）
log_info "使用 scp 上传..."
# 创建临时压缩包
TEMP_ARCHIVE="/tmp/what-to-eat-$(date +%s).tar.gz"
log_info "创建压缩包: $TEMP_ARCHIVE"
tar -czf "$TEMP_ARCHIVE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='logs' \
    --exclude='*.log' \
    -C "$PROJECT_DIR" .

# 上传压缩包
log_info "上传压缩包到服务器..."
$SCP_CMD "$TEMP_ARCHIVE" "$SERVER:$TEMP_ARCHIVE"

# 在服务器上解压
log_info "在服务器上解压文件..."
$SSH_CMD "$SERVER" "tar -xzf $TEMP_ARCHIVE -C $PROJECT_DIR_ON_SERVER && rm $TEMP_ARCHIVE"

# 删除本地压缩包
rm "$TEMP_ARCHIVE"
log_success "文件上传完成"

log_success "项目文件上传完成！"

# 显示后续步骤
echo
log_info "下一步操作："
echo
echo "1. 连接到服务器："
echo "   ssh $SERVER"
echo
echo "2. 进入项目目录："
echo "   cd $PROJECT_DIR_ON_SERVER"
echo
echo "3. 运行部署脚本："
echo "   chmod +x server-deploy.sh"
echo "   ./server-deploy.sh"
echo
echo "4. 或者手动部署："
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"
echo

# 询问是否立即连接服务器
read -p "是否立即连接到服务器？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "连接到服务器..."
    $SSH_CMD "$SERVER"
fi

log_success "上传完成！"
