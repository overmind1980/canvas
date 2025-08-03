# Railway CLI 换源安装完整指南

本指南提供了完整的 Railway CLI 换源安装解决方案，专门解决网络连接问题（如 ECONNRESET 错误）。

## 🚨 问题背景

在安装 Railway CLI 时，可能遇到以下网络错误：

```
FetchError: request to https://github.com/railwayapp/cli/releases/download/v4.6.0/railway-v4.6.0-aarch64-apple-darwin.tar.gz failed, reason: Client network socket disconnected before secure TLS connection was established
```

**常见原因：**
- 网络连接不稳定
- GitHub 访问受限
- 防火墙阻止连接
- DNS 解析问题
- 企业网络限制

## 🛠️ 解决方案工具

我们提供了多个工具来解决这些问题：

### 1. 🎯 一键解决方案（推荐）

**脚本：** `quick-railway-setup.sh`

```bash
# 一键安装和配置
./quick-railway-setup.sh
```

**功能：**
- ✅ 自动检测系统环境
- ✅ 智能选择最佳安装方式
- ✅ 自动修复 PATH 问题
- ✅ 完成登录配置
- ✅ 全程引导式操作

### 2. 🔄 换源安装脚本

**脚本：** `railway-mirror-install.sh`

```bash
# 交互式安装
./railway-mirror-install.sh

# 指定镜像源安装
./railway-mirror-install.sh -m npm-taobao    # 淘宝镜像
./railway-mirror-install.sh -m npm-tencent  # 腾讯云镜像
./railway-mirror-install.sh -m npm-huawei   # 华为云镜像
./railway-mirror-install.sh -m homebrew     # Homebrew
./railway-mirror-install.sh -m manual       # 手动下载

# 网络连接检测
./railway-mirror-install.sh -c

# 恢复默认 npm 源
./railway-mirror-install.sh -r
```

**支持的镜像源：**
- **淘宝镜像**：`https://registry.npmmirror.com/`
- **腾讯云镜像**：`https://mirrors.cloud.tencent.com/npm/`
- **华为云镜像**：`https://mirrors.huaweicloud.com/repository/npm/`

### 3. 🔧 增强登录脚本

**脚本：** `railway-login-fix.sh`（已更新）

```bash
# 智能登录修复
./railway-login-fix.sh
```

**新增功能：**
- ✅ 集成换源安装
- ✅ 网络连接检测
- ✅ 智能安装选择
- ✅ PATH 自动修复

### 4. 🛣️ PATH 修复工具

**脚本：** `fix-railway-path.sh`

```bash
# 修复 PATH 问题
./fix-railway-path.sh
```

## 📋 使用场景

### 场景 1: 首次安装（推荐）

```bash
# 使用一键安装脚本
./quick-railway-setup.sh
```

### 场景 2: 网络问题

```bash
# 检测网络连接
./railway-mirror-install.sh -c

# 使用淘宝镜像安装
./railway-mirror-install.sh -m npm-taobao
```

### 场景 3: 安装失败重试

```bash
# 清理后重新安装
npm uninstall -g @railway/cli
npm cache clean --force
./railway-mirror-install.sh
```

### 场景 4: PATH 问题

```bash
# 修复 PATH
./fix-railway-path.sh

# 或使用登录脚本（包含 PATH 修复）
./railway-login-fix.sh
```

### 场景 5: 企业网络环境

```bash
# 设置代理
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port

# 使用镜像源安装
./railway-mirror-install.sh -m npm-taobao
```

## 🔍 故障排除流程

### 步骤 1: 诊断问题

```bash
# 检查网络连接
curl -I https://github.com
curl -I https://registry.npmjs.org
curl -I https://registry.npmmirror.com

# 检查 Railway CLI 状态
which railway
railway --version
```

### 步骤 2: 选择解决方案

| 问题类型 | 推荐解决方案 |
|---------|-------------|
| 网络连接失败 | `./railway-mirror-install.sh -m npm-taobao` |
| PATH 问题 | `./fix-railway-path.sh` |
| 登录问题 | `./railway-login-fix.sh` |
| 综合问题 | `./quick-railway-setup.sh` |

### 步骤 3: 验证安装

```bash
# 验证安装
railway --version
railway whoami

# 测试部署
./deploy-railway.sh
```

## 📚 详细文档

- **[RAILWAY_NETWORK_TROUBLESHOOTING.md](RAILWAY_NETWORK_TROUBLESHOOTING.md)** - 网络故障排除详细指南
- **[RAILWAY_PATH_FIX_GUIDE.md](RAILWAY_PATH_FIX_GUIDE.md)** - PATH 问题修复指南
- **[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)** - 部署完整指南

## 🎯 快速参考

### 常用命令

```bash
# 一键解决所有问题
./quick-railway-setup.sh

# 换源安装
./railway-mirror-install.sh -m npm-taobao

# 修复 PATH
./fix-railway-path.sh

# 登录修复
./railway-login-fix.sh

# 网络检测
./railway-mirror-install.sh -c
```

### 镜像源对比

| 镜像源 | 速度 | 稳定性 | 推荐场景 |
|-------|------|--------|----------|
| 淘宝镜像 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 国内用户首选 |
| 腾讯云镜像 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 企业用户 |
| 华为云镜像 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 华为生态用户 |
| Homebrew | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | macOS 用户 |
| 手动下载 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 网络极差时 |

## 🆘 获取帮助

如果遇到问题，请按以下顺序尝试：

1. **查看错误日志**：仔细阅读错误信息
2. **检查网络连接**：`./railway-mirror-install.sh -c`
3. **尝试不同镜像源**：`./railway-mirror-install.sh`
4. **查看详细文档**：阅读相关 `.md` 文件
5. **使用一键脚本**：`./quick-railway-setup.sh`

### 提供反馈时请包含：

```bash
# 系统信息
uname -a
node --version
npm --version

# 网络测试
curl -I https://github.com
nslookup github.com

# 错误日志
npm install -g @railway/cli --verbose
```

## 🎉 成功案例

### 案例 1: 网络连接问题

**问题**：`ECONNRESET` 错误
**解决**：使用淘宝镜像源
```bash
./railway-mirror-install.sh -m npm-taobao
```

### 案例 2: PATH 问题

**问题**：`railway: command not found`
**解决**：PATH 修复
```bash
./fix-railway-path.sh
```

### 案例 3: 企业网络

**问题**：防火墙阻止
**解决**：代理 + 镜像源
```bash
export HTTP_PROXY=http://proxy:8080
./railway-mirror-install.sh -m npm-tencent
```

---

**🚀 现在就开始使用换源安装工具，快速部署你的画板应用吧！**