#!/bin/bash

# What To Eat 项目部署脚本
set -e

echo "🚀 开始部署 What To Eat 项目..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建日志目录
mkdir -p logs

# 停止并删除现有容器
echo "🛑 停止现有容器..."
docker-compose down --remove-orphans

# 构建并启动容器
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache

echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 检查健康状态
echo "🏥 检查健康状态..."
sleep 5  # 给 Nginx 更多时间启动

# 使用 curl 检查服务状态
if curl -f -s http://localhost:80 > /dev/null; then
    echo "✅ 服务启动成功！"
    echo "🌐 访问地址: http://localhost"
else
    echo "❌ 服务启动失败，请检查日志"
    docker-compose logs what-to-eat
    exit 1
fi

echo "🎉 部署完成！"
