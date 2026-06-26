#!/bin/bash

# 遇到任何错误时立即退出
set -e

# 定义目标部署目录，支持通过第一个参数传入自定义路径进行测试/部署
TARGET_DIR="${1:-/home/relic/nginx/web/mycodelab}"

echo "=== 开始构建与部署流程 ==="

# 1. 检查 node_modules，若不存在则进行安装
if [ ! -d "node_modules" ]; then
    echo "未检测到 node_modules，正在执行 npm install 安装依赖..."
    npm install
else
    echo "检测到 node_modules 已存在，跳过依赖安装步骤。"
fi

# 2. 执行项目打包
echo "正在打包项目..."
npm run build

# 3. 检查并准备目标部署目录
echo "正在检查目标目录: $TARGET_DIR"
if [ ! -d "$TARGET_DIR" ]; then
    echo "目标目录不存在，正在尝试创建..."
    mkdir -p "$TARGET_DIR" || {
        echo "【错误】无法创建目标目录 $TARGET_DIR。"
        echo "提示：您可能需要以管理员权限运行此脚本，或者手动创建该目录并赋予当前用户写权限。"
        exit 1
    }
fi

# 4. 安全地清理目标目录下的旧产物
echo "正在清理目标目录中的旧产物..."
if [ -n "$TARGET_DIR" ] && [ "$TARGET_DIR" != "/" ]; then
    # 使用 ${TARGET_DIR:?} 防止变量为空时的安全风险
    rm -rf "${TARGET_DIR:?}"/*
fi

# 5. 拷贝构建好的产物到目标目录
echo "正在将构建产物拷贝至目标目录..."
if [ -d "dist" ]; then
    cp -r dist/* "$TARGET_DIR/" || {
        echo "【错误】拷贝文件到 $TARGET_DIR 失败。"
        echo "提示：请检查是否有该目录的写权限。"
        exit 1
    }
else
    echo "【错误】未找到 dist 目录，请检查打包是否成功。"
    exit 1
fi

echo "=== 构建并部署成功！ ==="
echo "部署路径: $TARGET_DIR"
