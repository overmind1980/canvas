# 🚀 Railway部署快速开始

只需3步，让你的二次元画板应用在Railway上运行！

## 🚀 快速部署到Railway

### 前提条件
- 已安装Node.js (推荐v18+)
- 拥有Railway账户

### 步骤1：安装Railway CLI
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 如果遇到权限问题，使用sudo
sudo npm install -g @railway/cli

# 验证安装
railway --version
```

### 步骤2：登录Railway

**标准登录：**
```bash
railway login
```

**如果遇到登录错误，使用以下方式：**

1. **Browserless模式（推荐）**
   ```bash
   railway login --browserless
   ```
   复制显示的链接到浏览器完成认证

2. **Token登录**
   - 访问 [Railway Tokens页面](https://railway.app/account/tokens)
   - 创建新Token
   - 使用Token登录：
   ```bash
   railway login --token YOUR_TOKEN_HERE
   ```

3. **环境变量方式**
   ```bash
   export RAILWAY_TOKEN=YOUR_TOKEN_HERE
   ```

### 步骤3：一键部署
```bash
chmod +x deploy-railway.sh
./deploy-railway.sh
```

> 💡 **提示**：部署脚本已自动处理登录问题，会优先尝试browserless模式

## 🎯 快速部署（推荐）

### 方法一：使用自动化脚本
```bash
./deploy-railway.sh
```

### 方法二：手动部署
```bash
# 1. 安装Railway CLI
npm install -g @railway/cli

# 2. 登录Railway
railway login

# 3. 部署项目
railway init
railway up
```

## 📋 部署清单

在开始部署前，确保你已经：
- ✅ 注册了Railway账号 ([railway.app](https://railway.app))
- ✅ 项目文件完整（所有必需文件都在项目目录中）
- ✅ 网络连接正常

## 🎨 部署后功能

部署成功后，你的画板应用将支持：
- 🖌️ 完整的绘画工具（画笔、橡皮擦、形状工具等）
- 💾 **服务器端保存功能**（图片保存到Railway服务器）
- 🌐 全球访问（Railway提供的域名）
- 📱 移动端适配
- 🎯 自动备份和恢复

## ⚡ 预期结果

部署完成后，你会看到：
```
✅ 部署完成！
🌐 访问你的应用: https://your-app-name.railway.app
📊 查看日志: railway logs
⚙️  管理项目: railway open
```

## 🔧 管理命令

```bash
# 查看应用状态
railway status

# 查看日志
railway logs

# 打开Railway控制台
railway open

# 查看域名
railway domain

# 重新部署
railway up
```

## 🆘 遇到问题？

1. **部署失败**：检查网络连接，确保已登录Railway
2. **应用无法访问**：等待1-2分钟让服务完全启动
3. **保存功能异常**：查看Railway控制台的日志

更多详细信息请查看 `RAILWAY_DEPLOYMENT.md`

---

🎉 **准备好了吗？运行 `./deploy-railway.sh` 开始你的Railway之旅！**