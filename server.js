/**
 * 二次元画板应用 - 服务器端文件
 * 处理作品的服务器保存功能
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const net = require('net');

const app = express();
const DEFAULT_PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// 创建上传目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const ARTWORKS_DIR = path.join(UPLOAD_DIR, 'artworks');
const THUMBNAILS_DIR = path.join(UPLOAD_DIR, 'thumbnails');
const IMAGES_DIR = path.join(UPLOAD_DIR, 'images'); // 用户上传的图像文件

// 确保目录存在
async function ensureDirectories() {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await fs.mkdir(ARTWORKS_DIR, { recursive: true });
        await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
        await fs.mkdir(IMAGES_DIR, { recursive: true });
        console.log('📁 上传目录已创建');
    } catch (error) {
        console.error('创建目录失败:', error);
    }
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ARTWORKS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'artwork-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 配置multer用于图像文件上传
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, IMAGES_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB限制
    },
    fileFilter: function (req, file, cb) {
        // 只允许图片文件
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'));
        }
    }
});

const imageUpload = multer({ 
    storage: imageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB限制
    },
    fileFilter: function (req, file, cb) {
        // 只允许图片文件
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传 JPG, PNG, GIF, WebP 格式的图像文件'));
        }
    }
});

// 数据库文件路径（使用JSON文件作为简单数据库）
const DB_FILE = path.join(__dirname, 'artworks.json');

// 数据库操作函数
class ArtworkDatabase {
    static async readDB() {
        try {
            const data = await fs.readFile(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // 如果文件不存在，返回空数组
            return [];
        }
    }

    static async writeDB(data) {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    }

    static async addArtwork(artwork) {
        const artworks = await this.readDB();
        artwork.id = Date.now().toString();
        artwork.createdAt = new Date().toISOString();
        artworks.unshift(artwork);
        
        // 限制最大数量
        if (artworks.length > 1000) {
            artworks.splice(1000);
        }
        
        await this.writeDB(artworks);
        return artwork;
    }

    static async getArtworks(limit = 50, offset = 0) {
        const artworks = await this.readDB();
        return artworks.slice(offset, offset + limit);
    }

    static async getArtwork(id) {
        const artworks = await this.readDB();
        return artworks.find(artwork => artwork.id === id);
    }

    static async deleteArtwork(id) {
        const artworks = await this.readDB();
        const index = artworks.findIndex(artwork => artwork.id === id);
        
        if (index !== -1) {
            const deleted = artworks.splice(index, 1)[0];
            await this.writeDB(artworks);
            return deleted;
        }
        
        return null;
    }

    static async updateArtwork(id, updates) {
        const artworks = await this.readDB();
        const index = artworks.findIndex(artwork => artwork.id === id);
        
        if (index !== -1) {
            artworks[index] = { ...artworks[index], ...updates, updatedAt: new Date().toISOString() };
            await this.writeDB(artworks);
            return artworks[index];
        }
        
        return null;
    }
}

// 工具函数
function base64ToBuffer(base64String) {
    // 移除data:image/png;base64,前缀
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

function generateThumbnail(base64Image) {
    // 这里可以使用sharp或其他图像处理库来生成缩略图
    // 为了简单起见，这里直接返回原图的缩小版本
    return base64Image;
}

// API路由

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 保存作品到服务器
app.post('/api/artworks', async (req, res) => {
    try {
        const { title, imageData, thumbnail, tags } = req.body;
        
        if (!title || !imageData) {
            return res.status(400).json({ 
                success: false, 
                message: '标题和图片数据是必需的' 
            });
        }
        
        // 保存图片文件
        const imageBuffer = base64ToBuffer(imageData);
        const filename = `artwork-${Date.now()}.png`;
        const filepath = path.join(ARTWORKS_DIR, filename);
        
        await fs.writeFile(filepath, imageBuffer);
        
        // 生成缩略图
        let thumbnailFilename = null;
        if (thumbnail) {
            const thumbnailBuffer = base64ToBuffer(thumbnail);
            thumbnailFilename = `thumb-${Date.now()}.png`;
            const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename);
            await fs.writeFile(thumbnailPath, thumbnailBuffer);
        }
        
        // 保存到数据库
        const artwork = await ArtworkDatabase.addArtwork({
            title,
            filename,
            thumbnailFilename,
            tags: tags || [],
            fileSize: imageBuffer.length,
            mimeType: 'image/png'
        });
        
        res.json({
            success: true,
            message: '作品保存成功',
            data: artwork
        });
        
    } catch (error) {
        console.error('保存作品失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 获取作品列表
app.get('/api/artworks', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const artworks = await ArtworkDatabase.getArtworks(limit, offset);
        
        res.json({
            success: true,
            data: artworks,
            pagination: {
                limit,
                offset,
                total: artworks.length
            }
        });
        
    } catch (error) {
        console.error('获取作品列表失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 获取单个作品
app.get('/api/artworks/:id', async (req, res) => {
    try {
        const artwork = await ArtworkDatabase.getArtwork(req.params.id);
        
        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: '作品未找到'
            });
        }
        
        res.json({
            success: true,
            data: artwork
        });
        
    } catch (error) {
        console.error('获取作品失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 获取作品图片
app.get('/api/artworks/:id/image', async (req, res) => {
    try {
        const artwork = await ArtworkDatabase.getArtwork(req.params.id);
        
        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: '作品未找到'
            });
        }
        
        const imagePath = path.join(ARTWORKS_DIR, artwork.filename);
        
        // 检查文件是否存在
        try {
            await fs.access(imagePath);
            res.sendFile(imagePath);
        } catch (error) {
            res.status(404).json({
                success: false,
                message: '图片文件未找到'
            });
        }
        
    } catch (error) {
        console.error('获取作品图片失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 获取作品缩略图
app.get('/api/artworks/:id/thumbnail', async (req, res) => {
    try {
        const artwork = await ArtworkDatabase.getArtwork(req.params.id);
        
        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: '作品未找到'
            });
        }
        
        if (!artwork.thumbnailFilename) {
            // 如果没有缩略图，返回原图
            return res.redirect(`/api/artworks/${req.params.id}/image`);
        }
        
        const thumbnailPath = path.join(THUMBNAILS_DIR, artwork.thumbnailFilename);
        
        try {
            await fs.access(thumbnailPath);
            res.sendFile(thumbnailPath);
        } catch (error) {
            // 如果缩略图不存在，返回原图
            res.redirect(`/api/artworks/${req.params.id}/image`);
        }
        
    } catch (error) {
        console.error('获取缩略图失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 删除作品
app.delete('/api/artworks/:id', async (req, res) => {
    try {
        const artwork = await ArtworkDatabase.getArtwork(req.params.id);
        
        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: '作品未找到'
            });
        }
        
        // 删除文件
        const imagePath = path.join(ARTWORKS_DIR, artwork.filename);
        try {
            await fs.unlink(imagePath);
        } catch (error) {
            console.warn('删除图片文件失败:', error.message);
        }
        
        // 删除缩略图
        if (artwork.thumbnailFilename) {
            const thumbnailPath = path.join(THUMBNAILS_DIR, artwork.thumbnailFilename);
            try {
                await fs.unlink(thumbnailPath);
            } catch (error) {
                console.warn('删除缩略图文件失败:', error.message);
            }
        }
        
        // 从数据库删除
        await ArtworkDatabase.deleteArtwork(req.params.id);
        
        res.json({
            success: true,
            message: '作品删除成功'
        });
        
    } catch (error) {
        console.error('删除作品失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 更新作品信息
app.put('/api/artworks/:id', async (req, res) => {
    try {
        const { title, tags } = req.body;
        
        const updatedArtwork = await ArtworkDatabase.updateArtwork(req.params.id, {
            title,
            tags
        });
        
        if (!updatedArtwork) {
            return res.status(404).json({
                success: false,
                message: '作品未找到'
            });
        }
        
        res.json({
            success: true,
            message: '作品更新成功',
            data: updatedArtwork
        });
        
    } catch (error) {
        console.error('更新作品失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 文件上传接口（用于直接上传图片文件）
app.post('/api/upload', upload.single('artwork'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }
        
        const { title, tags } = req.body;
        
        // 保存到数据库
        const artwork = await ArtworkDatabase.addArtwork({
            title: title || '未命名作品',
            filename: req.file.filename,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        });
        
        res.json({
            success: true,
            message: '文件上传成功',
            data: artwork
        });
        
    } catch (error) {
        console.error('文件上传失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 图像上传接口
app.post('/api/upload-image', imageUpload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有上传图像文件' });
        }

        res.json({
            success: true,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: `/uploads/images/${req.file.filename}`
        });
    } catch (error) {
        console.error('图像上传错误:', error);
        res.status(500).json({ error: '图像上传失败' });
    }
});

// 获取服务器统计信息
app.get('/api/stats', async (req, res) => {
    try {
        const artworks = await ArtworkDatabase.readDB();
        
        // 计算统计信息
        const stats = {
            totalArtworks: artworks.length,
            totalSize: artworks.reduce((sum, artwork) => sum + (artwork.fileSize || 0), 0),
            recentArtworks: artworks.slice(0, 10),
            createdToday: artworks.filter(artwork => {
                const today = new Date().toDateString();
                const artworkDate = new Date(artwork.createdAt).toDateString();
                return today === artworkDate;
            }).length
        };
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: '文件大小超过限制（最大10MB）'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? error.message : '服务器错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 检查端口是否可用
function checkPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => {
                resolve(true);
            });
            server.close();
        });
        server.on('error', () => {
            resolve(false);
        });
    });
}

// 查找可用端口
async function findAvailablePort(startPort) {
    let port = startPort;
    while (port < startPort + 100) {
        if (await checkPortAvailable(port)) {
            return port;
        }
        port++;
    }
    throw new Error('无法找到可用端口');
}

// 启动服务器
async function startServer() {
    try {
        await ensureDirectories();
        
        const PORT = await findAvailablePort(DEFAULT_PORT);
        
        app.listen(PORT, () => {
            console.log(`🎨 二次元画板服务器已启动`);
            console.log(`🌐 访问地址: http://localhost:${PORT}`);
            console.log(`📁 上传目录: ${UPLOAD_DIR}`);
            console.log(`💾 数据库文件: ${DB_FILE}`);
            
            if (PORT !== DEFAULT_PORT) {
                console.log(`⚠️  默认端口 ${DEFAULT_PORT} 被占用，已自动切换到端口 ${PORT}`);
            }
        });
    } catch (error) {
        console.error('启动服务器失败:', error);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});

// 启动服务器
startServer();

module.exports = app;