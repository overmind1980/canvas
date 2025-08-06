// 碳粒粒子类
class CarbonParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2; // 水平速度
        this.vy = Math.random() * 1 + 0.5; // 垂直速度（向下）- 降低速度
        this.size = Math.random() * 1 + 0.75; // 粒子大小 - 调整为0.75-1.75
        this.life = 5.0; // 生命值 - 延长到5
        this.decay = Math.random() * 0.01 + 0.005; // 衰减速度 - 降低
        this.gravity = 0.1; // 重力
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; // 应用重力
        this.life -= this.decay;
        this.size *= 0.99; // 粒子逐渐变小
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.8;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0 || this.size <= 0.1;
    }
}

// 洞穴画 - 简化版应用
class CaveDrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.particleCanvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.particleCtx = this.particleCanvas.getContext('2d');
        
        this.isDrawing = false;
        this.brushSize = 8;
        this.brushOpacity = 0.8;
        this.brushColor = '#000000'; // 确保炭笔始终为黑色
        
        this.audioElement = document.getElementById('bullfightMusic');
        this.musicToggle = document.getElementById('musicToggle');
        this.isPlaying = false;
        
        // 粒子系统
        this.particles = [];
        this.animationId = null;
        
        this.initCanvas();
        this.bindEvents();
        this.setupMusic();
        this.startParticleAnimation();
    }
    
    initCanvas() {
        // 设置画布背景为深红色
        this.ctx.fillStyle = '#8B0000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置炭笔效果
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    bindEvents() {
        // 画布绘画事件
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // 触摸事件支持
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // 控制按钮事件
        this.musicToggle.addEventListener('click', this.toggleMusic.bind(this));
        document.getElementById('exportBtn').addEventListener('click', this.exportCanvas.bind(this));
        document.getElementById('galleryBtn').addEventListener('click', this.showGallery.bind(this));
        document.getElementById('backToCanvas').addEventListener('click', this.hideGallery.bind(this));
    }
    
    setupMusic() {
        // 设置音频元素
        this.audioElement.volume = 0.5;
        console.log('音频元素初始化成功');
    }
    
    toggleMusic() {
        if (this.isPlaying) {
            this.stopMusic();
        } else {
            this.playMusic();
        }
    }
    
    playMusic() {
        try {
            this.audioElement.play();
            this.isPlaying = true;
            this.musicToggle.classList.add('playing');
            console.log('开始播放斗牛音乐');
        } catch (error) {
            console.log('音频播放失败:', error);
        }
    }
    
    stopMusic() {
        try {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.isPlaying = false;
            this.musicToggle.classList.remove('playing');
            console.log('停止播放斗牛音乐');
        } catch (error) {
            console.log('音频停止失败:', error);
        }
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + 7; // 向下偏移5个像素
        
        this.lastX = x;
        this.lastY = y;
        
        // 开始绘制点
        this.drawCharcoalDot(x, y);
        
        // 在开始绘画时也生成碳粒
        this.generateCarbonParticles(x, y);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + 5; // 向下偏移5个像素
        
        this.drawCharcoalLine(this.lastX, this.lastY, x, y);
        
        // 在绘画时生成碳粒
        this.generateCarbonParticles(x, y);
        
        this.lastX = x;
        this.lastY = y;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                         e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }
    
    drawCharcoalDot(x, y) {
        this.ctx.save();
        this.ctx.globalAlpha = this.brushOpacity;
        this.ctx.fillStyle = '#000000'; // 强制使用黑色
        
        // 创建炭笔纹理效果
        for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() - 0.5) * this.brushSize * 0.3;
            const offsetY = (Math.random() - 0.5) * this.brushSize * 0.3;
            const size = this.brushSize * (0.7 + Math.random() * 0.3);
            
            this.ctx.globalAlpha = this.brushOpacity * (0.3 + Math.random() * 0.4);
            this.ctx.fillStyle = '#000000'; // 确保每个点都是黑色
            this.ctx.beginPath();
            this.ctx.arc(x + offsetX, y + offsetY, size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawCharcoalLine(x1, y1, x2, y2) {
        this.ctx.save();
        this.ctx.globalAlpha = this.brushOpacity;
        this.ctx.strokeStyle = '#000000'; // 强制使用黑色
        this.ctx.lineWidth = this.brushSize;
        
        // 主线条
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        
        // 添加炭笔纹理
        for (let i = 0; i < 3; i++) {
            const offsetX = (Math.random() - 0.5) * this.brushSize * 0.2;
            const offsetY = (Math.random() - 0.5) * this.brushSize * 0.2;
            
            this.ctx.globalAlpha = this.brushOpacity * (0.2 + Math.random() * 0.3);
            this.ctx.strokeStyle = '#000000'; // 确保纹理线条也是黑色
            this.ctx.lineWidth = this.brushSize * (0.5 + Math.random() * 0.3);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1 + offsetX, y1 + offsetY);
            this.ctx.lineTo(x2 + offsetX, y2 + offsetY);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    exportCanvas() {
        const link = document.createElement('a');
        link.download = `洞穴壁画_${new Date().getTime()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        
        // 同时保存到本地存储
        this.saveToGallery();
    }
    
    saveToGallery() {
        const imageData = this.canvas.toDataURL();
        const artworks = JSON.parse(localStorage.getItem('caveArtworks') || '[]');
        
        artworks.push({
            id: Date.now(),
            data: imageData,
            timestamp: new Date().toLocaleString('zh-CN')
        });
        
        // 限制最多保存20幅作品
        if (artworks.length > 20) {
            artworks.shift();
        }
        
        localStorage.setItem('caveArtworks', JSON.stringify(artworks));
    }
    
    showGallery() {
        const galleryPage = document.getElementById('galleryPage');
        const artworkGrid = document.getElementById('artworkGrid');
        
        // 清空画廊
        artworkGrid.innerHTML = '';
        
        // 加载作品
        const artworks = JSON.parse(localStorage.getItem('caveArtworks') || '[]');
        
        if (artworks.length === 0) {
            artworkGrid.innerHTML = '<p style="text-align: center; color: #D4A574; grid-column: 1 / -1;">还没有壁画作品</p>';
        } else {
            artworks.reverse().forEach(artwork => {
                const item = document.createElement('div');
                item.className = 'artwork-item';
                item.innerHTML = `
                    <img src="${artwork.data}" alt="洞穴壁画">
                    <div style="padding: 10px; text-align: center; color: #D4A574; font-size: 12px;">
                        ${artwork.timestamp}
                    </div>
                `;
                artworkGrid.appendChild(item);
            });
        }
        
        galleryPage.style.display = 'flex';
    }
    
    hideGallery() {
        document.getElementById('galleryPage').style.display = 'none';
    }
    
    // 生成碳粒粒子
    generateCarbonParticles(x, y) {
        // 随机生成1-3个碳粒
        const particleCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < particleCount; i++) {
            // 在炭笔头位置附近生成粒子（考虑光标偏移）
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            
            const particle = new CarbonParticle(
                x + offsetX - 10, // 向左上偏移，模拟炭笔头位置
                y + offsetY - 10
            );
            
            this.particles.push(particle);
        }
        
        // 限制粒子数量，避免性能问题
        if (this.particles.length > 100) {
            this.particles = this.particles.slice(-50);
        }
    }
    
    // 粒子动画循环
    startParticleAnimation() {
        const animate = () => {
            // 更新粒子
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const particle = this.particles[i];
                particle.update();
                
                // 移除死亡的粒子
                if (particle.isDead()) {
                    this.particles.splice(i, 1);
                }
            }
            
            // 清除粒子层并重绘所有粒子
            this.drawParticles();
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // 绘制粒子
    drawParticles() {
        // 清除粒子画布
        this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
        
        // 在独立的粒子画布上绘制粒子
        this.particles.forEach(particle => {
            particle.draw(this.particleCtx);
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CaveDrawingApp();
});