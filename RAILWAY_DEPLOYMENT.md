# 🚀 Railway平台部署指南

本指南将帮助你将二次元画板应用部署到Railway平台，获得完整的服务器保存功能。

## 📋 部署前准备

### 1. 注册Railway账号
- 访问 [Railway.app](https://railway.app)
- 使用GitHub账号注册登录
- 获得免费的$5月度额度

### 2. 准备项目代码
确保项目包含以下文件：
- ✅ `package.json` - 项目依赖和启动脚本
- ✅ `server.js` - Node.js服务器文件
- ✅ `railway.json` - Railway配置文件
- ✅ 所有前端文件（HTML、CSS、JS）

## 🛠️ 部署步骤

### 方法一：通过GitHub部署（推荐）

1. **推送代码到GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Railway deployment"
   git branch -M main
   git remote add origin https://github.com/你的用户名/anime-canvas-app.git
   git push -u origin main
   ```

2. **在Railway创建项目**
   - 登录Railway控制台
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库
   - 点击 "Deploy Now"

3. **等待部署完成**
   - Railway会自动检测Node.js项目
   - 安装依赖并启动服务器
   - 部署完成后会提供访问URL

### 方法二：通过Railway CLI部署

1. **安装Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **登录Railway**
   ```bash
   railway login
   ```
   
   **如果遇到登录问题，请参考下方的故障排除指南**

3. **初始化项目**
   ```bash
   railway init
   ```

4. **部署项目**
   ```bash
   railway up
   ```

## ⚙️ 环境配置

### 环境变量设置
在Railway控制台的Variables标签页添加：

```
PORT=3000
NODE_ENV=production
```

### 域名配置
- Railway会自动分配一个 `.railway.app` 域名
- 可以在Settings中配置自定义域名

## 📁 文件存储说明

### 持久化存储
Railway提供临时文件系统，重启后文件会丢失。对于生产环境建议：

1. **集成云存储服务**（推荐）
   - AWS S3
   - Cloudinary
   - 阿里云OSS

2. **使用Railway Volume**
   - 在控制台添加Volume
   - 挂载到 `/app/uploads` 目录

## 🔧 配置文件说明

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### package.json关键配置
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

## 🎯 部署后验证

1. **访问应用**
   - 打开Railway提供的URL
   - 确认画板界面正常显示

2. **测试保存功能**
   - 绘制一幅作品
   - 点击保存按钮
   - 确认显示"作品已保存到服务器"提示

3. **检查文件存储**
   - 访问 `/api/artworks` 查看作品列表
   - 确认图片文件正常保存

## 🚨 常见问题

### Railway CLI安装和权限问题

如果遇到 `zsh: permission denied: railway` 或 `railway not found` 错误：

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 如果遇到权限问题，使用sudo
sudo npm install -g @railway/cli

# 验证安装
railway --version
```

### 部署失败
- 检查 `package.json` 中的启动脚本
- 确认所有依赖都在 `dependencies` 中
- 查看Railway部署日志

### 保存功能异常
- 检查服务器日志
- 确认uploads目录权限
- 验证API接口响应

### 性能优化
- 启用gzip压缩
- 配置静态文件缓存
- 使用CDN加速

## 🔧 故障排除指南

### Railway CLI 登录问题

#### 问题1：`Error logging in to CLI. Please try again with --browserless`

**解决方案：**

1. **使用browserless模式登录**
   ```bash
   railway login --browserless
   ```
   这会显示一个链接，复制到浏览器中完成认证

2. **使用Token登录**
   - 访问 [Railway Dashboard](https://railway.app/account/tokens)
   - 创建新的API Token
   - 使用token登录：
   ```bash
   railway login --token YOUR_TOKEN_HERE
   ```

3. **设置环境变量**
   ```bash
   export RAILWAY_TOKEN=YOUR_TOKEN_HERE
   railway deploy
   ```

#### 问题2：网络连接问题

**症状**：连接超时或网络错误

**解决方案：**
- 检查网络连接
- 尝试使用VPN
- 使用代理：
  ```bash
  export HTTP_PROXY=http://your-proxy:port
  export HTTPS_PROXY=http://your-proxy:port
  railway login --browserless
  ```

#### 问题3：权限问题

**症状**：`Permission denied` 或 `Access denied`

**解决方案：**
- 确保有Railway账户访问权限
- 重新生成API Token
- 检查团队权限设置

### 部署问题

#### 构建失败
- 检查 `package.json` 中的依赖
- 确保Node.js版本兼容
- 查看Railway构建日志

#### 服务启动失败
- 检查端口配置（使用 `process.env.PORT`）
- 确保所有环境变量已设置
- 查看应用日志

### 获取帮助

- [Railway文档](https://docs.railway.app/)
- [Railway Discord社区](https://discord.gg/railway)
- [GitHub Issues](https://github.com/railwayapp/cli/issues)

## 💰 费用说明

- **免费额度**：每月$5
- **计费方式**：按使用时间计费
- **休眠机制**：无访问时自动休眠节省费用

## 📞 技术支持

- Railway文档：https://docs.railway.app
- 社区支持：https://railway.app/discord
- GitHub Issues：项目仓库issues页面

---

🎨 **恭喜！你的二次元画板应用现在可以在全球范围内访问，并支持完整的服务器保存功能！**