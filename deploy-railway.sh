#!/bin/bash

# Railway部署脚本
# 使用方法: ./deploy-railway.sh

echo "🚀 开始部署到Railway平台..."

# 强化的Railway CLI检测和安装函数
check_and_install_railway() {
    echo "🔍 检查Railway CLI安装状态..."
    
    # 方法1: 使用command检测
    if command -v railway &> /dev/null; then
        echo "✅ Railway CLI已安装 (通过command检测)"
        return 0
    fi
    
    # 方法2: 检查常见安装路径
    local common_paths=(
        "/opt/homebrew/bin/railway"
        "/usr/local/bin/railway"
        "$HOME/.npm-global/bin/railway"
        "$(npm config get prefix)/bin/railway"
    )
    
    for path in "${common_paths[@]}"; do
        if [ -f "$path" ] && [ -x "$path" ]; then
            echo "✅ Railway CLI已安装在: $path"
            # 添加到当前会话的PATH
            export PATH="$(dirname "$path"):$PATH"
            return 0
        fi
    done
    
    # 方法3: 尝试直接执行npm bin路径
    local npm_bin_path="$(npm bin -g 2>/dev/null)/railway"
    if [ -f "$npm_bin_path" ] && [ -x "$npm_bin_path" ]; then
        echo "✅ Railway CLI已安装在npm全局目录: $npm_bin_path"
        export PATH="$(dirname "$npm_bin_path"):$PATH"
        return 0
    fi
    
    echo "❌ Railway CLI未安装，正在自动安装..."
    npm install -g @railway/cli
    
    if [ $? -ne 0 ]; then
        echo "❌ Railway CLI安装失败"
        echo "请尝试以下解决方案："
        echo "1. 手动安装：npm install -g @railway/cli"
        echo "2. 使用sudo权限：sudo npm install -g @railway/cli"
        echo "3. 重新启动终端后再试"
        exit 1
    fi
    
    echo "✅ Railway CLI安装成功"
    
    # 安装后重新检测
    echo "🔄 刷新PATH并重新检测..."
    
    # 添加npm全局bin目录到PATH
    local npm_global_bin="$(npm bin -g 2>/dev/null)"
    if [ -n "$npm_global_bin" ]; then
        export PATH="$npm_global_bin:$PATH"
    fi
    
    # 最终验证
    if ! command -v railway &> /dev/null; then
        echo "⚠️  Railway CLI已安装但可能需要重新启动终端"
        echo "请重新启动终端后再运行此脚本"
        exit 1
    fi
}

# 调用检测函数
check_and_install_railway

# 检查是否已登录
echo "🔐 检查Railway登录状态..."
if ! railway whoami &> /dev/null; then
    echo "🔐 正在登录Railway..."
    echo "如果浏览器登录失败，请选择以下方式之一："
    echo "1. 使用browserless模式: railway login --browserless"
    echo "2. 使用token登录: railway login --token YOUR_TOKEN"
    echo "3. 手动设置环境变量: export RAILWAY_TOKEN=YOUR_TOKEN"
    echo ""
    echo "正在尝试browserless登录..."
    
    # 首先尝试browserless登录
    if ! railway login --browserless; then
        echo "❌ Browserless登录失败"
        echo "请手动执行以下命令之一："
        echo "  railway login --browserless"
        echo "  railway login --token YOUR_TOKEN"
        echo "  export RAILWAY_TOKEN=YOUR_TOKEN && railway deploy"
        exit 1
    fi
fi

# 检查是否已初始化项目
if [ ! -f "railway.toml" ] && [ ! -f ".railway" ]; then
    echo "🎯 初始化Railway项目..."
    railway init
fi

# 部署项目
echo "📦 开始部署..."
railway up

echo "✅ 部署完成！"
echo "🌐 访问你的应用: $(railway domain)"
echo "📊 查看日志: railway logs"
echo "⚙️  管理项目: railway open"

echo ""
echo "🎨 恭喜！你的二次元画板应用已成功部署到Railway！"
echo "现在可以在全球范围内访问，并支持完整的服务器保存功能。"