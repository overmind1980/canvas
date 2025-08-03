#!/bin/bash

# Railway CLI 换源安装脚本
# 解决网络连接问题，提供多种镜像源和安装方式

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

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检测网络连接
check_network() {
    log_info "检测网络连接..."
    
    # 检测是否能访问 GitHub
    if curl -s --connect-timeout 5 https://github.com >/dev/null 2>&1; then
        log_success "GitHub 连接正常"
        return 0
    else
        log_warning "GitHub 连接失败，建议使用镜像源"
        return 1
    fi
}

# 设置 npm 镜像源
set_npm_registry() {
    local registry="$1"
    local name="$2"
    
    log_info "设置 npm 镜像源为 $name..."
    npm config set registry "$registry"
    
    # 验证设置
    local current_registry=$(npm config get registry)
    if [[ "$current_registry" == "$registry" ]]; then
        log_success "npm 镜像源设置成功: $registry"
        return 0
    else
        log_error "npm 镜像源设置失败"
        return 1
    fi
}

# 恢复默认 npm 源
restore_npm_registry() {
    log_info "恢复默认 npm 源..."
    npm config set registry https://registry.npmjs.org/
    log_success "已恢复默认 npm 源"
}

# 清理 npm 缓存
clean_npm_cache() {
    log_info "清理 npm 缓存..."
    npm cache clean --force
    log_success "npm 缓存清理完成"
}

# 通过 npm 安装 Railway CLI
install_via_npm() {
    local registry="$1"
    local name="$2"
    
    log_info "使用 $name 安装 Railway CLI..."
    
    # 设置镜像源
    set_npm_registry "$registry" "$name"
    
    # 清理缓存
    clean_npm_cache
    
    # 卸载现有版本（如果存在）
    if command_exists railway; then
        log_info "卸载现有 Railway CLI..."
        npm uninstall -g @railway/cli 2>/dev/null || true
    fi
    
    # 清理可能存在的残留文件
    if [[ -d "$HOME/.npm-global/lib/node_modules/@railway" ]]; then
        log_info "清理残留文件..."
        rm -rf "$HOME/.npm-global/lib/node_modules/@railway"
    fi
    
    # 安装 Railway CLI
    log_info "正在安装 Railway CLI..."
    if npm install -g @railway/cli; then
        log_success "Railway CLI 安装成功"
        return 0
    else
        log_error "Railway CLI 安装失败"
        return 1
    fi
}

# 通过 Homebrew 安装
install_via_homebrew() {
    log_info "使用 Homebrew 安装 Railway CLI..."
    
    if ! command_exists brew; then
        log_error "Homebrew 未安装，请先安装 Homebrew"
        return 1
    fi
    
    # 更新 Homebrew
    log_info "更新 Homebrew..."
    brew update
    
    # 安装 Railway CLI
    if brew install railway; then
        log_success "Railway CLI 通过 Homebrew 安装成功"
        return 0
    else
        log_error "Homebrew 安装失败"
        return 1
    fi
}

# 手动下载安装
manual_download_install() {
    log_info "手动下载安装 Railway CLI..."
    
    # 检测系统架构
    local arch
    case "$(uname -m)" in
        x86_64) arch="x86_64" ;;
        arm64|aarch64) arch="aarch64" ;;
        *) 
            log_error "不支持的系统架构: $(uname -m)"
            return 1
            ;;
    esac
    
    # 检测操作系统
    local os
    case "$(uname -s)" in
        Darwin) os="apple-darwin" ;;
        Linux) os="unknown-linux-gnu" ;;
        *)
            log_error "不支持的操作系统: $(uname -s)"
            return 1
            ;;
    esac
    
    local version="v4.6.0"
    local filename="railway-${version}-${arch}-${os}.tar.gz"
    local download_url="https://github.com/railwayapp/cli/releases/download/${version}/${filename}"
    
    # 创建临时目录
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    log_info "下载 Railway CLI: $filename"
    
    # 尝试多个下载方式
    local download_success=false
    
    # 方式1: 直接下载
    if curl -L -o "$filename" "$download_url" 2>/dev/null; then
        download_success=true
    # 方式2: 使用代理（如果设置了）
    elif [[ -n "$HTTP_PROXY" ]] && curl -L --proxy "$HTTP_PROXY" -o "$filename" "$download_url" 2>/dev/null; then
        download_success=true
    # 方式3: 使用 wget
    elif command_exists wget && wget -O "$filename" "$download_url" 2>/dev/null; then
        download_success=true
    fi
    
    if [[ "$download_success" != "true" ]]; then
        log_error "下载失败，请检查网络连接或使用代理"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # 解压文件
    log_info "解压文件..."
    tar -xzf "$filename"
    
    # 安装到系统路径
    local install_dir="/usr/local/bin"
    if [[ ! -w "$install_dir" ]]; then
        install_dir="$HOME/.local/bin"
        mkdir -p "$install_dir"
    fi
    
    log_info "安装到 $install_dir"
    cp railway "$install_dir/railway"
    chmod +x "$install_dir/railway"
    
    # 清理临时文件
    cd - >/dev/null
    rm -rf "$temp_dir"
    
    # 检查安装
    if command_exists railway; then
        log_success "Railway CLI 手动安装成功"
        return 0
    else
        log_warning "安装完成，但可能需要将 $install_dir 添加到 PATH"
        echo "请运行: export PATH=\"$install_dir:\$PATH\""
        return 0
    fi
}

# 验证安装
verify_installation() {
    log_info "验证 Railway CLI 安装..."
    
    if command_exists railway; then
        local version=$(railway --version 2>/dev/null || echo "未知版本")
        log_success "Railway CLI 安装成功，版本: $version"
        
        # 显示安装路径
        local railway_path=$(which railway)
        log_info "安装路径: $railway_path"
        
        return 0
    else
        log_error "Railway CLI 验证失败，命令不可用"
        return 1
    fi
}

# 显示使用帮助
show_help() {
    echo "Railway CLI 换源安装脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -m, --method METHOD 指定安装方式 (npm-taobao|npm-tencent|npm-huawei|homebrew|manual)"
    echo "  -c, --check         仅检查网络连接"
    echo "  -r, --restore       恢复默认 npm 源"
    echo ""
    echo "安装方式:"
    echo "  npm-taobao   使用淘宝镜像源通过 npm 安装"
    echo "  npm-tencent  使用腾讯云镜像源通过 npm 安装"
    echo "  npm-huawei   使用华为云镜像源通过 npm 安装"
    echo "  homebrew     使用 Homebrew 安装"
    echo "  manual       手动下载安装"
    echo ""
    echo "示例:"
    echo "  $0                    # 交互式安装"
    echo "  $0 -m npm-taobao     # 使用淘宝源安装"
    echo "  $0 -c                 # 检查网络连接"
    echo "  $0 -r                 # 恢复默认 npm 源"
}

# 交互式选择安装方式
interactive_install() {
    echo "请选择安装方式:"
    echo "1) 淘宝镜像源 (npm)"
    echo "2) 腾讯云镜像源 (npm)"
    echo "3) 华为云镜像源 (npm)"
    echo "4) Homebrew"
    echo "5) 手动下载"
    echo "6) 退出"
    echo ""
    read -p "请输入选择 (1-6): " choice
    
    case $choice in
        1)
            install_via_npm "https://registry.npmmirror.com/" "淘宝镜像源"
            ;;
        2)
            install_via_npm "https://mirrors.cloud.tencent.com/npm/" "腾讯云镜像源"
            ;;
        3)
            install_via_npm "https://mirrors.huaweicloud.com/repository/npm/" "华为云镜像源"
            ;;
        4)
            install_via_homebrew
            ;;
        5)
            manual_download_install
            ;;
        6)
            log_info "退出安装"
            exit 0
            ;;
        *)
            log_error "无效选择，请重新运行脚本"
            exit 1
            ;;
    esac
}

# 主函数
main() {
    echo "=== Railway CLI 换源安装脚本 ==="
    echo ""
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -m|--method)
                METHOD="$2"
                shift 2
                ;;
            -c|--check)
                check_network
                exit $?
                ;;
            -r|--restore)
                restore_npm_registry
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查必要工具
    if ! command_exists node; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command_exists npm; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    # 检查网络连接
    check_network
    network_ok=$?
    
    # 根据指定方式安装
    if [[ -n "$METHOD" ]]; then
        case "$METHOD" in
            npm-taobao)
                install_via_npm "https://registry.npmmirror.com/" "淘宝镜像源"
                ;;
            npm-tencent)
                install_via_npm "https://mirrors.cloud.tencent.com/npm/" "腾讯云镜像源"
                ;;
            npm-huawei)
                install_via_npm "https://mirrors.huaweicloud.com/repository/npm/" "华为云镜像源"
                ;;
            homebrew)
                install_via_homebrew
                ;;
            manual)
                manual_download_install
                ;;
            *)
                log_error "不支持的安装方式: $METHOD"
                exit 1
                ;;
        esac
    else
        # 交互式安装
        interactive_install
    fi
    
    # 验证安装
    if verify_installation; then
        echo ""
        log_success "Railway CLI 安装完成！"
        echo ""
        echo "接下来你可以:"
        echo "1. 运行 'railway login' 登录你的 Railway 账户"
        echo "2. 运行 'railway --help' 查看可用命令"
        echo "3. 如果遇到 PATH 问题，运行 './fix-railway-path.sh' 修复"
        echo ""
        
        # 恢复默认 npm 源（如果使用了镜像源）
        if [[ "$METHOD" == npm-* ]]; then
            echo "是否恢复默认 npm 源？(y/N)"
            read -p "请输入选择: " restore_choice
            if [[ "$restore_choice" =~ ^[Yy]$ ]]; then
                restore_npm_registry
            fi
        fi
    else
        echo ""
        log_error "Railway CLI 安装失败！"
        echo ""
        echo "故障排除建议:"
        echo "1. 检查网络连接"
        echo "2. 尝试使用代理: export HTTP_PROXY=http://proxy:port"
        echo "3. 尝试不同的安装方式"
        echo "4. 查看详细错误日志"
        echo "5. 联系技术支持"
        exit 1
    fi
}

# 运行主函数
main "$@"