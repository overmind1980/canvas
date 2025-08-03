#!/bin/bash

# Railway登录故障排除脚本
# 解决常见的Railway CLI登录问题

echo "🔧 Railway登录故障排除工具"
echo "================================"
echo ""

# 智能Railway CLI检测和PATH修复函数
check_and_install_railway() {
    echo "🔍 智能检测Railway CLI状态..."
    
    # 定义搜索路径
    local RAILWAY_PATHS=(
        "/opt/homebrew/bin/railway"           # Homebrew (Apple Silicon)
        "/usr/local/bin/railway"              # Homebrew (Intel)
        "$HOME/.npm-global/bin/railway"       # npm全局目录
        "$(npm bin -g 2>/dev/null)/railway"   # npm动态全局目录
        "$HOME/.local/bin/railway"            # 本地安装
        "/usr/bin/railway"                    # 系统安装
        "$HOME/bin/railway"                   # 用户bin目录
        "$(npm config get prefix 2>/dev/null)/bin/railway"  # npm配置路径
    )
    
    local RAILWAY_FOUND=""
    
    # 方法1: 标准PATH检测
    if command -v railway &> /dev/null; then
        echo "✅ Railway CLI已在PATH中"
        RAILWAY_FOUND="$(which railway)"
        railway --version
        return 0
    fi
    
    echo "⚠️  Railway CLI不在PATH中，正在搜索常见位置..."
    
    # 方法2: 搜索常见安装位置
    for path in "${RAILWAY_PATHS[@]}"; do
        if [[ -n "$path" && -f "$path" && -x "$path" ]]; then
            echo "✅ 找到Railway CLI: $path"
            RAILWAY_FOUND="$path"
            RAILWAY_DIR="$(dirname "$path")"
            
            # 临时添加到PATH
            export PATH="$RAILWAY_DIR:$PATH"
            echo "✅ 已临时添加到PATH: $RAILWAY_DIR"
            
            # 验证版本
            "$path" --version
            
            # 提供永久修复建议
            echo "💡 要永久修复PATH，请运行以下命令之一："
            if [[ "$SHELL" == *"zsh"* ]]; then
                echo "   echo 'export PATH=\"$RAILWAY_DIR:\$PATH\"' >> ~/.zshrc && source ~/.zshrc"
            else
                echo "   echo 'export PATH=\"$RAILWAY_DIR:\$PATH\"' >> ~/.bashrc && source ~/.bashrc"
            fi
            
            return 0
        fi
    done
    
    # 方法3: 如果仍未找到，尝试安装
    if [[ -z "$RAILWAY_FOUND" ]]; then
        echo "❌ Railway CLI未安装，正在智能安装..."
        
        # 检查npm是否可用
        if ! command -v npm &> /dev/null; then
            echo "❌ npm未安装，无法自动安装Railway CLI"
            echo "请先安装Node.js和npm，然后手动安装：npm install -g @railway/cli"
            exit 1
        fi
        
        # 检测网络连接
        echo "🔍 检测网络连接..."
        if curl -s --connect-timeout 5 https://github.com >/dev/null 2>&1; then
            echo "✅ GitHub 连接正常，使用标准安装"
            npm install -g @railway/cli
        else
            echo "⚠️  GitHub 连接失败，尝试换源安装"
            echo "正在使用换源安装脚本..."
            
            # 检查换源安装脚本是否存在
            if [[ -f "./railway-mirror-install.sh" ]]; then
                echo "🔧 使用换源安装脚本"
                ./railway-mirror-install.sh -m npm-taobao
            else
                echo "⚠️  换源安装脚本不存在，尝试使用淘宝镜像源"
                # 临时设置淘宝镜像源
                local original_registry=$(npm config get registry)
                npm config set registry https://registry.npmmirror.com/
                npm cache clean --force
                npm install -g @railway/cli
                # 恢复原始镜像源
                npm config set registry "$original_registry"
            fi
        fi
        
        if [ $? -ne 0 ]; then
            echo "❌ Railway CLI安装失败"
            echo "请尝试以下解决方案："
            echo "1. 运行换源安装脚本：./railway-mirror-install.sh"
            echo "2. 手动安装：npm install -g @railway/cli"
            echo "3. 使用sudo权限：sudo npm install -g @railway/cli"
            echo "4. 配置npm全局目录：npm config set prefix ~/.npm-global"
            echo "5. 查看网络故障排除指南：cat RAILWAY_NETWORK_TROUBLESHOOTING.md"
            echo "6. 重新启动终端后再试"
            exit 1
        fi
        
        echo "✅ Railway CLI安装成功"
        
        # 安装后重新检测和PATH修复
        echo "🔄 刷新PATH并重新检测..."
        
        # 获取npm全局bin目录
        local npm_global_bin="$(npm bin -g 2>/dev/null)"
        if [ -n "$npm_global_bin" ]; then
            export PATH="$npm_global_bin:$PATH"
            echo "✅ 已添加npm全局目录到PATH: $npm_global_bin"
        fi
        
        # 尝试刷新shell配置
        if [ -f "$HOME/.zshrc" ]; then
            source "$HOME/.zshrc" 2>/dev/null || true
        fi
        if [ -f "$HOME/.bashrc" ]; then
            source "$HOME/.bashrc" 2>/dev/null || true
        fi
        
        # 最终验证
        if command -v railway &> /dev/null; then
            echo "✅ Railway CLI现在可用"
            railway --version
        else
            echo "⚠️  Railway CLI已安装但PATH可能需要手动修复"
            echo "请尝试以下解决方案："
            echo "1. 重新启动终端"
            if [[ "$SHELL" == *"zsh"* ]]; then
                echo "2. 运行: source ~/.zshrc"
                echo "3. 或添加到PATH: echo 'export PATH=\"$(npm bin -g):\$PATH\"' >> ~/.zshrc"
            else
                echo "2. 运行: source ~/.bashrc"
                echo "3. 或添加到PATH: echo 'export PATH=\"$(npm bin -g):\$PATH\"' >> ~/.bashrc"
            fi
        fi
    fi
}

# 调用检测函数
check_and_install_railway

echo ""
echo "🔍 检查当前登录状态..."
if railway whoami &> /dev/null; then
    echo "✅ 已登录Railway"
    railway whoami
    echo ""
    echo "🎉 Railway CLI已就绪，可以开始部署！"
    echo "运行部署命令: ./deploy-railway.sh"
    exit 0
fi

echo "❌ 未登录Railway，开始登录流程..."
echo ""

echo "请选择登录方式："
echo "1. Browserless模式（推荐，解决浏览器问题）"
echo "2. Token登录（需要手动获取Token）"
echo "3. 标准浏览器登录"
echo "4. 环境变量登录"
echo "5. 显示详细帮助"
echo ""
read -p "请输入选择 (1-5): " choice

case $choice in
    1)
        echo "🔐 使用Browserless模式登录..."
        echo "将显示一个链接，请复制到浏览器中完成认证"
        railway login --browserless
        ;;
    2)
        echo "🔑 Token登录模式"
        echo "1. 访问: https://railway.app/account/tokens"
        echo "2. 点击 'Create Token'"
        echo "3. 复制生成的Token"
        echo ""
        read -p "请输入您的Railway Token: " token
        if [ -n "$token" ]; then
            railway login --token "$token"
        else
            echo "❌ Token不能为空"
        fi
        ;;
    3)
        echo "🌐 标准浏览器登录..."
        railway login
        ;;
    4)
        echo "🔧 环境变量登录模式"
        echo "1. 访问: https://railway.app/account/tokens"
        echo "2. 创建新Token"
        echo "3. 设置环境变量"
        echo ""
        read -p "请输入您的Railway Token: " token
        if [ -n "$token" ]; then
            export RAILWAY_TOKEN="$token"
            echo "✅ 环境变量已设置"
            echo "现在可以直接使用 'railway deploy' 命令"
        else
            echo "❌ Token不能为空"
        fi
        ;;
    5)
        echo "📚 详细帮助信息"
        echo ""
        echo "常见登录问题及解决方案："
        echo ""
        echo "1. 'Error logging in to CLI. Please try again with --browserless'"
        echo "   解决：使用 railway login --browserless"
        echo ""
        echo "2. 网络连接问题"
        echo "   解决：检查网络，尝试VPN，或使用代理"
        echo "   export HTTP_PROXY=http://proxy:port"
        echo "   export HTTPS_PROXY=http://proxy:port"
        echo "   或使用换源安装：./railway-mirror-install.sh"
        echo ""
        echo "3. 权限问题"
        echo "   解决：重新生成Token，检查账户权限"
        echo ""
        echo "4. Token获取步骤："
        echo "   - 访问: https://railway.app/account/tokens"
        echo "   - 点击 'Create Token'"
        echo "   - 输入Token名称"
        echo "   - 复制生成的Token"
        echo ""
        echo "5. 获取更多帮助："
        echo "   - Railway文档: https://docs.railway.app/"
        echo "   - Discord社区: https://discord.gg/railway"
        echo "   - GitHub Issues: https://github.com/railwayapp/cli/issues"
        ;;
    *)
        echo "❌ 无效选择，请重新运行脚本"
        exit 1
        ;;
esac

echo ""
echo "🔍 验证登录状态..."
if railway whoami &> /dev/null; then
    echo "✅ 登录成功！"
    railway whoami
    echo ""
    echo "🎉 Railway CLI已完全就绪！"
    echo "现在可以运行部署脚本："
    echo "./deploy-railway.sh"
    echo ""
    echo "💡 如果下次启动新终端时railway命令不可用，请运行："
    echo "./fix-railway-path.sh"
else
    echo "❌ 登录失败，请尝试其他方式或查看详细帮助"
    echo "运行: ./railway-login-fix.sh 选择选项5查看详细帮助"
    echo ""
    echo "💡 如果遇到PATH问题，请运行："
    echo "./fix-railway-path.sh"
fi