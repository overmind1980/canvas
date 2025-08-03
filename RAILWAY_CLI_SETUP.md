# Railway CLI 安装和故障排除指南

## 📦 安装 Railway CLI

### 方法一：使用 npm 安装（推荐）
```bash
# 全局安装Railway CLI
npm install -g @railway/cli

# 验证安装
railway --version
```

### 方法二：如果遇到权限问题
```bash
# 使用sudo权限安装
sudo npm install -g @railway/cli

# 验证安装
railway --version
```

### 方法三：使用 yarn 安装
```bash
# 使用yarn全局安装
yarn global add @railway/cli

# 验证安装
railway --version
```

## 🔧 常见问题解决

### 1. `zsh: permission denied: railway`

**原因**：Railway CLI未安装或没有执行权限

**解决方案**：
```bash
# 检查是否已安装
which railway

# 如果未安装，执行安装
npm install -g @railway/cli

# 如果权限不足，使用sudo
sudo npm install -g @railway/cli
```

### 2. `railway not found`

**原因**：Railway CLI未正确安装或PATH环境变量问题

**解决方案**：
```bash
# 重新安装
npm uninstall -g @railway/cli
npm install -g @railway/cli

# 检查npm全局安装路径
npm config get prefix

# 确保PATH包含npm全局bin目录
echo $PATH
```

### 3. 登录问题：`Error logging in to CLI`

**解决方案**：
```bash
# 使用browserless模式登录
railway login --browserless

# 按照提示操作：
# 1. 复制显示的链接到浏览器
# 2. 在浏览器中完成认证
# 3. 复制token回到终端
```

### 4. 网络连接问题

**解决方案**：
```bash
# 检查网络连接
ping railway.app

# 如果使用代理，配置npm代理
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port

# 清除代理（如果不需要）
npm config delete proxy
npm config delete https-proxy
```

### 5. 版本冲突问题

**解决方案**：
```bash
# 完全卸载旧版本
npm uninstall -g @railway/cli
npm cache clean --force

# 重新安装最新版本
npm install -g @railway/cli@latest

# 验证版本
railway --version
```

## 🚀 验证安装

安装完成后，运行以下命令验证：

```bash
# 检查版本
railway --version

# 查看帮助
railway --help

# 检查登录状态
railway whoami
```

## 📝 自动化脚本

项目中提供了自动化脚本来处理这些问题：

- `./railway-login-fix.sh` - 自动安装CLI并处理登录问题
- `./deploy-railway.sh` - 完整的部署脚本，包含CLI安装检查

## 💡 提示

1. **权限问题**：在macOS/Linux上，如果遇到权限问题，使用`sudo`
2. **网络问题**：确保网络连接正常，必要时配置代理
3. **版本更新**：定期更新CLI到最新版本：`npm update -g @railway/cli`
4. **环境变量**：确保npm全局bin目录在PATH中

## 🆘 获取帮助

如果仍然遇到问题：

1. 查看Railway官方文档：https://docs.railway.app/
2. 检查Railway CLI GitHub仓库：https://github.com/railwayapp/cli
3. 联系Railway支持团队

---

**注意**：本指南适用于Railway CLI v4.x版本。如果使用其他版本，某些命令可能有所不同。