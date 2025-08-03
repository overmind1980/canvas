#!/bin/bash

# Railway CLI 一键安装和配置脚本
# 自动检测网络环境并选择最佳安装方式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 显示欢迎信息
show_welcome() {
    echo "🚀 Railway CLI 一键安装和配置脚本"
    echo "===================================="
    echo ""
    echo "本脚本将自动："
    echo "✅ 检测网络环境"
    echo "✅ 选择最佳安装方式"
    echo "✅ 安装 Railway CLI"
    echo "✅ 修复 PATH 问题"
    echo "✅ 完成登录配置"
    echo ""
}

# 检测系统环境
detect_environment() {
    log_step "检测系统环境..."
    
    # 检测操作系统
    case "$(uname -s)" in
        Darwin)
            OS="macOS"
            log_info "操作系统: macOS"
            ;;
        Linux)
            OS="Linux"
            log_info "操作系统: Linux"
            ;;
        *)
            OS="Unknown"
            log_warning "未知操作系统: $(uname -s)"
            ;;
    esac
    
    # 检测架构
    case "$(uname -m)" in
        x86_64)
            ARCH="x86_64"
            log_info "系统架构: x86_64"
            ;;
        arm64|aarch64)
            ARCH="arm64"
            log_info "系统架构: ARM64"
            ;;
        *)
            ARCH="unknown"
            log_warning "未知架构: $(uname -m)"
            ;;
    esac
    
    # 检测 Node.js 和 npm
    if command_exists node; then
        NODE_VERSION=$(node --version)
        log_success "Node.js 已安装: $NODE_VERSION"
    else
        log_error "Node.js 未安装，请先安装 Node.js"
        echo "请访问: https://nodejs.org/"
        exit 1
    fi
    
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        log_success "npm 已安装: $NPM_VERSION"
    else
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    # 检测 Homebrew (macOS)
    if [[ "$OS" == "macOS" ]] && command_exists brew; then
        BREW_VERSION=$(brew --version | head -n1)
        log_success "Homebrew 已安装: $BREW_VERSION"
        HAS_BREW=true
    else
        HAS_BREW=false
    fi
}

# 检测网络连接
check_network() {
    log_step "检测网络连接..."
    
    # 检测 GitHub 连接
    if curl -s --connect-timeout 5 https://github.com >/dev/null 2>&1; then
        log_success "GitHub 连接正常"
        GITHUB_OK=true
    else
        log_warning "GitHub 连接失败"
        GITHUB_OK=false
    fi
    
    # 检测 npm 注册表连接
    if curl -s --connect-timeout 5 https://registry.npmjs.org >/dev/null 2>&1; then
        log_success "npm 注册表连接正常"
        NPM_OK=true
    else
        log_warning "npm 注册表连接失败"
        NPM_OK=false
    fi
    
    # 检测淘宝镜像连接
    if curl -s --connect-timeout 5 https://registry.npmmirror.com >/dev/null 2>&1; then
        log_success "淘宝镜像连接正常"
        TAOBAO_OK=true
    else
        log_warning "淘宝镜像连接失败"
        TAOBAO_OK=false
    fi
}

# 检查 Railway CLI 是否已安装
check_railway_status() {
    log_step "检查 Railway CLI 状态..."
    
    if command_exists railway; then
        RAILWAY_VERSION=$(railway --version 2>/dev/null || echo "未知版本")
        log_success "Railway CLI 已安装: $RAILWAY_VERSION"
        log_info "安装路径: $(which railway)"
        RAILWAY_INSTALLED=true
        return 0
    else
        log_info "Railway CLI 未安装或不在 PATH 中"
        RAILWAY_INSTALLED=false
        return 1
    fi
}

# 选择最佳安装方式
select_install_method() {
    log_step "选择最佳安装方式..."
    
    # 如果已安装，跳过
    if [[ "$RAILWAY_INSTALLED" == "true" ]]; then
        log_info "Railway CLI 已安装，跳过安装步骤"
        return 0
    fi
    
    # 根据网络状况和系统环境选择安装方式
    if [[ "$OS" == "macOS" ]] && [[ "$HAS_BREW" == "true" ]]; then
        INSTALL_METHOD="homebrew"
        log_info "推荐使用 Homebrew 安装（macOS + Homebrew 环境）"
    elif [[ "$GITHUB_OK" == "true" ]] && [[ "$NPM_OK" == "true" ]]; then
        INSTALL_METHOD="npm-standard"
        log_info "推荐使用标准 npm 安装（网络连接良好）"
    elif [[ "$TAOBAO_OK" == "true" ]]; then
        INSTALL_METHOD="npm-taobao"
        log_info "推荐使用淘宝镜像安装（GitHub 连接问题）"
    else
        INSTALL_METHOD="manual"
        log_info "推荐使用手动下载安装（网络连接问题）"
    fi
    
    echo ""
    echo "🤔 是否使用推荐的安装方式？"
    echo "推荐方式: $INSTALL_METHOD"
    echo ""
    echo "选项:"
    echo "1) 使用推荐方式"
    echo "2) 手动选择安装方式"
    echo "3) 跳过安装"
    echo ""
    read -p "请输入选择 (1-3): " choice
    
    case $choice in
        1)
            log_info "使用推荐安装方式: $INSTALL_METHOD"
            ;;
        2)
            select_manual_method
            ;;
        3)
            log_info "跳过安装步骤"
            return 0
            ;;
        *)
            log_warning "无效选择，使用推荐方式"
            ;;
    esac
}

# 手动选择安装方式
select_manual_method() {
    echo ""
    echo "请选择安装方式:"
    echo "1) 标准 npm 安装"
    echo "2) 淘宝镜像 npm 安装"
    echo "3) 腾讯云镜像 npm 安装"
    echo "4) 华为云镜像 npm 安装"
    if [[ "$HAS_BREW" == "true" ]]; then
        echo "5) Homebrew 安装"
        echo "6) 手动下载安装"
        max_choice=6
    else
        echo "5) 手动下载安装"
        max_choice=5
    fi
    echo ""
    read -p "请输入选择 (1-$max_choice): " manual_choice
    
    case $manual_choice in
        1) INSTALL_METHOD="npm-standard" ;;
        2) INSTALL_METHOD="npm-taobao" ;;
        3) INSTALL_METHOD="npm-tencent" ;;
        4) INSTALL_METHOD="npm-huawei" ;;
        5)
            if [[ "$HAS_BREW" == "true" ]]; then
                INSTALL_METHOD="homebrew"
            else
                INSTALL_METHOD="manual"
            fi
            ;;
        6)
            if [[ "$HAS_BREW" == "true" ]]; then
                INSTALL_METHOD="manual"
            else
                log_error "无效选择"
                select_manual_method
                return
            fi
            ;;
        *)
            log_error "无效选择"
            select_manual_method
            return
            ;;
    esac
    
    log_info "已选择安装方式: $INSTALL_METHOD"
}

# 执行安装
perform_installation() {
    if [[ "$RAILWAY_INSTALLED" == "true" ]]; then
        return 0
    fi
    
    log_step "开始安装 Railway CLI..."
    
    case "$INSTALL_METHOD" in
        "npm-standard")
            log_info "使用标准 npm 安装..."
            npm install -g @railway/cli
            ;;
        "npm-taobao")
            log_info "使用淘宝镜像安装..."
            if [[ -f "./railway-mirror-install.sh" ]]; then
                ./railway-mirror-install.sh -m npm-taobao
            else
                # 临时设置镜像源
                local original_registry=$(npm config get registry)
                npm config set registry https://registry.npmmirror.com/
                npm cache clean --force
                npm install -g @railway/cli
                npm config set registry "$original_registry"
            fi
            ;;
        "npm-tencent")
            log_info "使用腾讯云镜像安装..."
            if [[ -f "./railway-mirror-install.sh" ]]; then
                ./railway-mirror-install.sh -m npm-tencent
            else
                local original_registry=$(npm config get registry)
                npm config set registry https://mirrors.cloud.tencent.com/npm/
                npm cache clean --force
                npm install -g @railway/cli
                npm config set registry "$original_registry"
            fi
            ;;
        "npm-huawei")
            log_info "使用华为云镜像安装..."
            if [[ -f "./railway-mirror-install.sh" ]]; then
                ./railway-mirror-install.sh -m npm-huawei
            else
                local original_registry=$(npm config get registry)
                npm config set registry https://mirrors.huaweicloud.com/repository/npm/
                npm cache clean --force
                npm install -g @railway/cli
                npm config set registry "$original_registry"
            fi
            ;;
        "homebrew")
            log_info "使用 Homebrew 安装..."
            if [[ -f "./railway-mirror-install.sh" ]]; then
                ./railway-mirror-install.sh -m homebrew
            else
                brew update
                brew install railway
            fi
            ;;
        "manual")
            log_info "使用手动下载安装..."
            if [[ -f "./railway-mirror-install.sh" ]]; then
                ./railway-mirror-install.sh -m manual
            else
                log_error "手动安装需要 railway-mirror-install.sh 脚本"
                return 1
            fi
            ;;
        *)
            log_error "未知安装方式: $INSTALL_METHOD"
            return 1
            ;;
    esac
    
    # 验证安装
    if command_exists railway; then
        RAILWAY_VERSION=$(railway --version 2>/dev/null || echo "未知版本")
        log_success "Railway CLI 安装成功: $RAILWAY_VERSION"
        RAILWAY_INSTALLED=true
    else
        log_error "Railway CLI 安装失败或不在 PATH 中"
        return 1
    fi
}

# 修复 PATH 问题
fix_path_issues() {
    log_step "检查和修复 PATH 问题..."
    
    if command_exists railway; then
        log_success "Railway CLI 在 PATH 中，无需修复"
        return 0
    fi
    
    log_info "Railway CLI 不在 PATH 中，尝试修复..."
    
    if [[ -f "./fix-railway-path.sh" ]]; then
        log_info "使用 PATH 修复脚本..."
        ./fix-railway-path.sh
    else
        log_warning "PATH 修复脚本不存在，手动修复..."
        
        # 常见安装路径
        local paths=(
            "/opt/homebrew/bin"
            "/usr/local/bin"
            "$(npm bin -g 2>/dev/null)"
            "$HOME/.npm-global/bin"
            "$HOME/.local/bin"
        )
        
        for path in "${paths[@]}"; do
            if [[ -n "$path" && -f "$path/railway" ]]; then
                log_info "找到 Railway CLI: $path/railway"
                export PATH="$path:$PATH"
                
                # 添加到 shell 配置文件
                if [[ "$SHELL" == *"zsh"* ]] && [[ -f "$HOME/.zshrc" ]]; then
                    echo "export PATH=\"$path:\$PATH\"" >> "$HOME/.zshrc"
                    log_success "已添加到 ~/.zshrc"
                elif [[ -f "$HOME/.bashrc" ]]; then
                    echo "export PATH=\"$path:\$PATH\"" >> "$HOME/.bashrc"
                    log_success "已添加到 ~/.bashrc"
                fi
                
                break
            fi
        done
    fi
    
    # 最终验证
    if command_exists railway; then
        log_success "PATH 修复成功"
    else
        log_warning "PATH 修复可能需要重启终端"
    fi
}

# 配置登录
setup_login() {
    log_step "配置 Railway 登录..."
    
    # 检查是否已登录
    if railway whoami >/dev/null 2>&1; then
        local current_user=$(railway whoami 2>/dev/null || echo "未知用户")
        log_success "已登录 Railway: $current_user"
        return 0
    fi
    
    log_info "未登录 Railway，开始登录配置..."
    
    if [[ -f "./railway-login-fix.sh" ]]; then
        log_info "使用登录修复脚本..."
        ./railway-login-fix.sh
    else
        log_info "手动登录..."
        echo ""
        echo "请选择登录方式:"
        echo "1) Browserless 模式（推荐）"
        echo "2) 标准浏览器登录"
        echo "3) 跳过登录"
        echo ""
        read -p "请输入选择 (1-3): " login_choice
        
        case $login_choice in
            1)
                log_info "使用 Browserless 模式登录..."
                railway login --browserless
                ;;
            2)
                log_info "使用标准浏览器登录..."
                railway login
                ;;
            3)
                log_info "跳过登录，稍后可手动登录"
                return 0
                ;;
            *)
                log_warning "无效选择，跳过登录"
                return 0
                ;;
        esac
    fi
    
    # 验证登录状态
    if railway whoami >/dev/null 2>&1; then
        local current_user=$(railway whoami 2>/dev/null || echo "未知用户")
        log_success "登录成功: $current_user"
    else
        log_warning "登录失败或跳过，稍后可手动登录"
    fi
}

# 显示完成信息
show_completion() {
    echo ""
    echo "🎉 Railway CLI 安装和配置完成！"
    echo "================================"
    echo ""
    
    if command_exists railway; then
        local version=$(railway --version 2>/dev/null || echo "未知版本")
        local path=$(which railway 2>/dev/null || echo "未知路径")
        echo "✅ Railway CLI 版本: $version"
        echo "✅ 安装路径: $path"
    else
        echo "⚠️  Railway CLI 可能需要重启终端后才能使用"
    fi
    
    if railway whoami >/dev/null 2>&1; then
        local user=$(railway whoami 2>/dev/null || echo "未知用户")
        echo "✅ 已登录用户: $user"
    else
        echo "⚠️  未登录，请稍后手动登录"
    fi
    
    echo ""
    echo "🚀 接下来你可以:"
    echo "1. 运行 'railway --help' 查看可用命令"
    echo "2. 运行 'railway login' 登录（如果未登录）"
    echo "3. 运行 './deploy-railway.sh' 部署项目"
    echo "4. 如果遇到问题，查看故障排除文档"
    echo ""
    echo "📚 相关文档:"
    echo "- RAILWAY_DEPLOYMENT.md - 部署指南"
    echo "- RAILWAY_NETWORK_TROUBLESHOOTING.md - 网络故障排除"
    echo "- RAILWAY_PATH_FIX_GUIDE.md - PATH 修复指南"
    echo ""
    echo "🎨 开始部署你的画板应用吧！"
}

# 主函数
main() {
    # 显示欢迎信息
    show_welcome
    
    # 检测环境
    detect_environment
    
    # 检测网络
    check_network
    
    # 检查 Railway CLI 状态
    check_railway_status
    
    # 选择安装方式
    select_install_method
    
    # 执行安装
    if ! perform_installation; then
        log_error "安装失败，请查看错误信息并重试"
        exit 1
    fi
    
    # 修复 PATH 问题
    fix_path_issues
    
    # 配置登录
    setup_login
    
    # 显示完成信息
    show_completion
}

# 运行主函数
main "$@"