# 🎨 二次元画板应用

- 一个功能丰富的二次元风格画板应用，使用原生HTML、CSS和JavaScript开发，支持多种绘画工具和本地保存功能。
- 可以在https://overmind1980.github.io/canvas/ 看效果。
- 新的修改

## ✨ 功能特色

### 🖌️ 绘画工具
- **画笔工具**: 支持大小、透明度、硬度调节
- **橡皮擦工具**: 可调节大小的橡皮擦
- **油漆桶工具**: 区域填充，支持容差设置
- **形状工具**: 矩形、椭圆、三角形、直线绘制
- **颜色选择**: 丰富的预设颜色和自定义颜色选择器

### 🎨 界面设计
- **二次元粉色风格**: 可爱的粉色调界面设计
- **响应式布局**: 适配不同屏幕尺寸
- **直观操作**: 简洁易用的工具栏和设置面板
- **实时预览**: 绘制过程中的实时预览效果

### 💾 保存功能
- **本地保存**: 作品自动保存到浏览器本地存储
- **服务器保存**: 支持将作品保存到服务器
- **作品管理**: 作品画廊，支持编辑、删除、导出
- **多格式导出**: PNG、JPEG、WebP格式导出

### ⌨️ 快捷键支持
- `Ctrl+Z`: 撤销
- `Ctrl+Y` / `Ctrl+Shift+Z`: 重做
- `Ctrl+S`: 保存作品
- `Delete`: 清空画布
- `1-4`: 快速切换工具

## 🚀 快速开始

### 方式一：直接使用（推荐）

1. 克隆或下载项目文件
2. 直接在浏览器中打开 `index.html` 文件
3. 开始创作！

### 方式二：使用服务器（支持服务器保存）

1. 确保已安装 Node.js (版本 >= 14.0.0)

2. 安装依赖：
```bash
npm install
```

3. 启动服务器：
```bash
npm start
```

4. 在浏览器中访问 `http://localhost:3000`

### 方式三：部署到Railway（云端服务器保存）

**快速部署：**
```bash
# 方式1: 标准安装（网络良好时）
npm install -g @railway/cli

# 方式2: 换源安装（网络问题时）
./railway-mirror-install.sh

# 一键部署
chmod +x deploy-railway.sh
./deploy-railway.sh
```

**网络问题？使用换源安装：**
```bash
# 自动选择最佳镜像源
./railway-mirror-install.sh

# 或指定特定镜像源
./railway-mirror-install.sh -m npm-taobao    # 淘宝镜像
./railway-mirror-install.sh -m npm-tencent  # 腾讯云镜像
./railway-mirror-install.sh -m homebrew     # Homebrew安装
./railway-mirror-install.sh -m manual       # 手动下载
```

**遇到问题？使用故障排除工具：**
```bash
# Railway CLI登录问题
./railway-login-fix.sh

# PATH问题（railway命令找不到）
./fix-railway-path.sh

# 网络连接检测
./railway-mirror-install.sh -c
```

**常见问题解决：**
- 🔧 `railway: command not found` → 运行 `./fix-railway-path.sh`
- 🔐 `Error logging in to CLI` → 运行 `./railway-login-fix.sh`
- 🌐 `ECONNRESET` 网络错误 → 运行 `./railway-mirror-install.sh`
- 📋 详细故障排除 → 查看 [RAILWAY_NETWORK_TROUBLESHOOTING.md](RAILWAY_NETWORK_TROUBLESHOOTING.md)
- 🛠️ PATH修复指南 → 查看 [RAILWAY_PATH_FIX_GUIDE.md](RAILWAY_PATH_FIX_GUIDE.md)

> 📚 详细部署指南请查看：[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

### 开发模式

```bash
npm run dev
```

## 📁 项目结构

```
anime-canvas-app/
├── index.html              # 主页面
├── server.js              # 服务器端代码
├── package.json           # 项目配置
├── README.md             # 项目说明
├── css/                  # 样式文件
│   ├── style.css         # 主样式
│   └── components.css    # 组件样式
├── js/                   # JavaScript文件
│   ├── app.js           # 主应用
│   ├── canvas.js        # 画布管理
│   ├── tools.js         # 绘画工具
│   ├── ui.js            # 界面管理
│   ├── storage.js       # 存储管理
│   └── utils.js         # 工具函数
└── uploads/             # 上传文件目录（服务器模式）
    ├── artworks/        # 作品文件
    └── thumbnails/      # 缩略图
```

## 🎯 使用指南

### 基本操作

1. **选择工具**: 点击左侧工具栏中的工具图标
2. **调整设置**: 在右侧属性面板中调整颜色、大小等参数
3. **开始绘画**: 在画布上拖拽鼠标进行绘制
4. **保存作品**: 点击顶部的保存按钮

### 工具详解

#### 🖌️ 画笔工具
- **大小**: 控制画笔粗细 (1-50px)
- **透明度**: 控制画笔透明度 (0-100%)
- **硬度**: 控制画笔边缘硬度 (0-100%)

#### 🧽 橡皮擦工具
- **大小**: 控制橡皮擦大小 (1-50px)
- 完全擦除选中区域的内容

#### 🪣 油漆桶工具
- **容差**: 控制填充的颜色相似度 (0-100)
- 点击画布区域进行颜色填充

#### 📐 形状工具
- **线条颜色**: 设置形状边框颜色
- **填充颜色**: 设置形状填充颜色
- **线条粗细**: 控制边框粗细 (1-20px)
- **启用填充**: 开关形状填充效果

### 作品管理

1. **查看作品**: 点击顶部的"画廊"按钮
2. **编辑作品**: 在画廊中点击"编辑"按钮
3. **删除作品**: 在画廊中点击"删除"按钮
4. **导出作品**: 点击"导出"按钮选择格式和质量

## 🔧 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **存储**: LocalStorage (客户端), JSON文件 (服务器端)
- **文件处理**: Multer
- **跨域**: CORS

## 🌟 特色功能

### 画笔硬度
画笔硬度功能通过调整画笔边缘的模糊程度来实现不同的绘画效果：
- **100% 硬度**: 清晰锐利的边缘
- **50% 硬度**: 中等柔和的边缘
- **0% 硬度**: 完全柔和的边缘

### 油漆桶填充
智能的区域填充算法，支持：
- **容差控制**: 精确控制填充范围
- **边界检测**: 自动识别填充边界
- **性能优化**: 高效的填充算法

### 形状绘制
支持多种基本形状的绘制：
- **矩形**: 支持正方形绘制（按住Shift）
- **椭圆**: 支持圆形绘制（按住Shift）
- **三角形**: 等边三角形绘制
- **直线**: 支持水平/垂直线（按住Shift）

## 📱 浏览器兼容性

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🐛 问题反馈

如果您发现任何问题或有改进建议，请在 [Issues](https://github.com/your-username/anime-canvas-app/issues) 页面提交。

## 📞 联系我们

- 项目主页: [GitHub Repository](https://github.com/your-username/anime-canvas-app)
- 问题反馈: [GitHub Issues](https://github.com/your-username/anime-canvas-app/issues)

## 🎉 更新日志

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- 🖌️ 基础绘画工具实现
- 🎨 二次元粉色风格界面
- 💾 本地和服务器保存功能
- ⌨️ 快捷键支持
- 📱 响应式设计

---

**享受创作的乐趣！** 🎨✨
