# Railway CLI 网络故障排除指南

本指南帮助解决 Railway CLI 安装和使用过程中遇到的网络连接问题。

## 🚨 常见网络错误

### 1. ECONNRESET 错误
```
FetchError: request to https://github.com/railwayapp/cli/releases/download/v4.6.0/railway-v4.6.0-aarch64-apple-darwin.tar.gz failed, reason: Client network socket disconnected before secure TLS connection was established
```

**原因**: 网络连接中断，通常由以下原因导致：
- 网络不稳定
- 防火墙阻止连接
- DNS 解析问题
- 代理配置问题

### 2. ETIMEDOUT 错误
```
connect ETIMEDOUT
```

**原因**: 连接超时，可能是：
- 网络延迟过高
- 目标服务器不可达
- 本地网络配置问题

### 3. ENOTFOUND 错误
```
getaddrinfo ENOTFOUND github.com
```

**原因**: DNS 解析失败：
- DNS 服务器问题
- 网络连接问题
- 域名被屏蔽

## 🔧 解决方案

### 方案 1: 使用换源安装脚本（推荐）

我们提供了专门的换源安装脚本来解决网络问题：

```bash
# 运行换源安装脚本
./railway-mirror-install.sh

# 或指定特定镜像源
./railway-mirror-install.sh -m npm-taobao
```

支持的镜像源：
- `npm-taobao`: 淘宝镜像源（推荐国内用户）
- `npm-tencent`: 腾讯云镜像源
- `npm-huawei`: 华为云镜像源
- `homebrew`: Homebrew 安装
- `manual`: 手动下载安装

### 方案 2: 配置代理

如果你使用代理服务器：

```bash
# 设置 HTTP 代理
export HTTP_PROXY=http://proxy-server:port
export HTTPS_PROXY=http://proxy-server:port

# 设置 npm 代理
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port

# 然后重新安装
npm install -g @railway/cli
```

### 方案 3: 更换 DNS 服务器

```bash
# 临时更换 DNS（macOS）
sudo networksetup -setdnsservers Wi-Fi 8.8.8.8 8.8.4.4

# 或使用 Cloudflare DNS
sudo networksetup -setdnsservers Wi-Fi 1.1.1.1 1.0.0.1
```

### 方案 4: 使用 Homebrew 安装

Homebrew 通常有更好的网络稳定性：

```bash
# 安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 使用 Homebrew 安装 Railway CLI
brew install railway
```

### 方案 5: 手动下载安装

如果自动安装失败，可以手动下载：

```bash
# 使用我们的手动安装脚本
./railway-mirror-install.sh -m manual
```

或手动操作：

1. 访问 [Railway CLI Releases](https://github.com/railwayapp/cli/releases)
2. 下载适合你系统的版本
3. 解压并移动到系统路径：

```bash
# 解压下载的文件
tar -xzf railway-v4.6.0-aarch64-apple-darwin.tar.gz

# 移动到系统路径
sudo mv railway /usr/local/bin/

# 添加执行权限
sudo chmod +x /usr/local/bin/railway
```

## 🔍 网络诊断工具

### 检查网络连接

```bash
# 检查 GitHub 连接
curl -I https://github.com

# 检查 npm 注册表连接
curl -I https://registry.npmjs.org

# 检查 DNS 解析
nslookup github.com
```

### 测试下载速度

```bash
# 测试 GitHub 下载速度
time curl -o /dev/null https://github.com/railwayapp/cli/releases/download/v4.6.0/railway-v4.6.0-aarch64-apple-darwin.tar.gz

# 测试镜像源速度
time curl -o /dev/null https://registry.npmmirror.com/@railway/cli
```

## 🛠️ 高级故障排除

### 清理网络缓存

```bash
# 清理 DNS 缓存（macOS）
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# 清理 npm 缓存
npm cache clean --force

# 重置 npm 配置
npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmjs.org/
```

### 检查防火墙设置

```bash
# 检查 macOS 防火墙状态
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# 临时关闭防火墙进行测试
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

### 网络接口重置

```bash
# 重置网络接口（macOS）
sudo ifconfig en0 down
sudo ifconfig en0 up

# 或重新连接 Wi-Fi
sudo networksetup -setairportpower en0 off
sudo networksetup -setairportpower en0 on
```

## 📋 故障排除检查清单

在寻求帮助之前，请完成以下检查：

- [ ] 检查网络连接是否正常
- [ ] 尝试访问 https://github.com
- [ ] 检查是否使用了代理或 VPN
- [ ] 尝试不同的安装方式
- [ ] 清理 npm 缓存
- [ ] 检查防火墙设置
- [ ] 尝试使用移动热点
- [ ] 检查系统时间是否正确

## 🆘 获取帮助

如果以上方法都无法解决问题，请提供以下信息：

1. **系统信息**:
   ```bash
   uname -a
   node --version
   npm --version
   ```

2. **网络测试结果**:
   ```bash
   curl -I https://github.com
   nslookup github.com
   ```

3. **完整错误日志**:
   ```bash
   npm install -g @railway/cli --verbose
   ```

4. **网络环境**:
   - 是否使用公司网络
   - 是否使用代理或 VPN
   - 网络运营商

## 📚 相关文档

- [Railway CLI 官方文档](https://docs.railway.app/develop/cli)
- [npm 网络故障排除](https://docs.npmjs.com/troubleshooting)
- [Node.js 网络问题](https://nodejs.org/en/docs/guides/troubleshooting/)

## 🔄 快速修复脚本

我们提供了一键修复脚本：

```bash
# 运行网络诊断和修复
./railway-mirror-install.sh -c

# 自动选择最佳安装方式
./railway-mirror-install.sh
```

---

**提示**: 如果你在企业网络环境中，可能需要联系网络管理员获取代理设置或防火墙配置。