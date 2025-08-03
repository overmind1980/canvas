#!/bin/bash

# Railway CLI PATH修复脚本
# 检测Railway CLI安装位置并添加到系统PATH中

echo "🔧 Railway CLI PATH修复工具"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检测Railway CLI的可能安装位置
RAILWAY_PATHS=(
    "/opt/homebrew/bin/railway"           # Homebrew (Apple Silicon)
    "/usr/local/bin/railway"              # Homebrew (Intel)
    "$HOME/.npm-global/bin/railway"       # npm全局目录
    "$(npm bin -g 2>/dev/null)/railway"   # npm动态全局目录
    "$HOME/.local/bin/railway"            # 本地安装
    "/usr/bin/railway"                    # 系统安装
    "$HOME/bin/railway"                   # 用户bin目录
)

echo "🔍 正在检测Railway CLI安装位置..."
RAILWAY_FOUND=""
RAILWAY_DIR=""

for path in "${RAILWAY_PATHS[@]}"; do
    if [[ -n "$path" && -f "$path" && -x "$path" ]]; then
        echo -e "${GREEN}✅ 找到Railway CLI: $path${NC}"
        RAILWAY_FOUND="$path"
        RAILWAY_DIR="$(dirname "$path")"
        break
    fi
done

if [[ -z "$RAILWAY_FOUND" ]]; then
    echo -e "${RED}❌ 未找到Railway CLI可执行文件${NC}"
    echo "请确认Railway CLI已正确安装:"
    echo "npm install -g @railway/cli"
    echo "或"
    echo "brew install railway"
    exit 1
fi

# 检查版本
echo ""
echo "📋 Railway CLI信息:"
echo "位置: $RAILWAY_FOUND"
echo "版本: $($RAILWAY_FOUND --version 2>/dev/null || echo '无法获取版本')"
echo ""

# 检查当前PATH是否包含Railway目录
if echo "$PATH" | grep -q "$RAILWAY_DIR"; then
    echo -e "${GREEN}✅ Railway目录已在当前PATH中${NC}"
    echo "当前会话可以直接使用railway命令"
else
    echo -e "${YELLOW}⚠️  Railway目录不在当前PATH中${NC}"
    echo "正在添加到当前会话PATH..."
    export PATH="$RAILWAY_DIR:$PATH"
    echo -e "${GREEN}✅ 已添加到当前会话PATH${NC}"
fi

# 测试railway命令
echo ""
echo "🧪 测试railway命令..."
if command -v railway &> /dev/null; then
    echo -e "${GREEN}✅ railway命令可用${NC}"
    railway --version
else
    echo -e "${RED}❌ railway命令仍不可用${NC}"
    exit 1
fi

echo ""
echo "🔧 永久性PATH修复选项:"
echo "1. 自动修复 (推荐)"
echo "2. 手动修复"
echo "3. 仅当前会话 (跳过永久修复)"
echo "4. 显示详细说明"
echo ""
read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🔄 开始自动修复...${NC}"
        
        # 检测当前shell
        CURRENT_SHELL=$(basename "$SHELL")
        echo "检测到shell: $CURRENT_SHELL"
        
        # 确定配置文件
        case $CURRENT_SHELL in
            "zsh")
                CONFIG_FILE="$HOME/.zshrc"
                ;;
            "bash")
                if [[ -f "$HOME/.bash_profile" ]]; then
                    CONFIG_FILE="$HOME/.bash_profile"
                elif [[ -f "$HOME/.bashrc" ]]; then
                    CONFIG_FILE="$HOME/.bashrc"
                else
                    CONFIG_FILE="$HOME/.bash_profile"
                fi
                ;;
            "fish")
                CONFIG_FILE="$HOME/.config/fish/config.fish"
                ;;
            *)
                CONFIG_FILE="$HOME/.profile"
                ;;
        esac
        
        echo "配置文件: $CONFIG_FILE"
        
        # 检查是否已经添加过
        EXPORT_LINE="export PATH=\"$RAILWAY_DIR:\$PATH\""
        if [[ -f "$CONFIG_FILE" ]] && grep -q "$RAILWAY_DIR" "$CONFIG_FILE"; then
            echo -e "${YELLOW}⚠️  PATH配置可能已存在${NC}"
        else
            echo "正在添加PATH配置到 $CONFIG_FILE..."
            echo "" >> "$CONFIG_FILE"
            echo "# Railway CLI PATH (auto-added by fix-railway-path.sh)" >> "$CONFIG_FILE"
            echo "$EXPORT_LINE" >> "$CONFIG_FILE"
            echo -e "${GREEN}✅ PATH配置已添加${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}🎉 自动修复完成！${NC}"
        echo "请执行以下命令之一来应用更改:"
        echo "1. 重新启动终端"
        echo "2. 运行: source $CONFIG_FILE"
        echo "3. 运行: exec $CURRENT_SHELL"
        ;;
    2)
        echo -e "${BLUE}📝 手动修复说明:${NC}"
        echo ""
        echo "请将以下行添加到您的shell配置文件中:"
        echo ""
        echo -e "${YELLOW}export PATH=\"$RAILWAY_DIR:\$PATH\"${NC}"
        echo ""
        echo "常见配置文件位置:"
        echo "- Zsh: ~/.zshrc"
        echo "- Bash: ~/.bash_profile 或 ~/.bashrc"
        echo "- Fish: ~/.config/fish/config.fish"
        echo "- 通用: ~/.profile"
        echo ""
        echo "添加后请重新启动终端或运行 'source 配置文件路径'"
        ;;
    3)
        echo -e "${GREEN}✅ 当前会话已可使用railway命令${NC}"
        echo "注意: 新的终端会话需要重新运行此脚本"
        ;;
    4)
        echo -e "${BLUE}📚 详细说明:${NC}"
        echo ""
        echo "问题原因:"
        echo "- Railway CLI已安装但其目录不在系统PATH中"
        echo "- npm全局安装的包可能安装在非标准路径"
        echo "- shell配置文件未包含正确的PATH设置"
        echo ""
        echo "解决方案:"
        echo "1. 检测Railway CLI实际安装位置"
        echo "2. 将其目录添加到PATH环境变量"
        echo "3. 更新shell配置文件以永久保存设置"
        echo ""
        echo "验证方法:"
        echo "- 运行 'which railway' 应显示可执行文件路径"
        echo "- 运行 'railway --version' 应显示版本信息"
        echo "- 运行 'echo \$PATH' 应包含Railway目录"
        echo ""
        echo "常见问题:"
        echo "- 如果仍有问题，请检查文件权限"
        echo "- 确保Railway CLI文件具有执行权限"
        echo "- 某些系统可能需要重新登录才能生效"
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🔧 PATH修复工具执行完成${NC}"
echo "如有问题，请查看 RAILWAY_CLI_TROUBLESHOOTING.md 获取更多帮助"