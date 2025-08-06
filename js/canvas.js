/**
 * 二次元画板应用 - 画布管理文件
 * 处理画布的基本操作、渲染和状态管理
 */

class CanvasManager {
    constructor(canvas, previewCanvas) {
        // 支持传入元素或ID
        this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
        this.previewCanvas = typeof previewCanvas === 'string' ? document.getElementById(previewCanvas) : previewCanvas;
        
        if (!this.canvas) {
            throw new Error('主画布元素未找到');
        }
        if (!this.previewCanvas) {
            throw new Error('预览画布元素未找到');
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.isDrawing = false;
        this.showGrid = false;
        this.backgroundColor = '#8B0000';
        
        // 初始化画布
        this.init();
    }

    /**
     * 初始化画布
     */
    init() {
        // 设置画布背景
        this.clearCanvas();
        
        // 保存初始状态
        this.saveState();
        
        // 设置画布样式
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 绑定画布事件
     */
    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // 触摸事件（移动端支持）
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // 防止默认的触摸行为
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
    }

    /**
     * 鼠标按下事件
     */
    handleMouseDown(e) {
        this.isDrawing = true;
        const coords = Utils.getCanvasCoordinates(this.canvas, e);
        this.startDrawing(coords.x, coords.y);
    }

    /**
     * 鼠标移动事件
     */
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        const coords = Utils.getCanvasCoordinates(this.canvas, e);
        this.continueDrawing(coords.x, coords.y);
    }

    /**
     * 鼠标抬起事件
     */
    handleMouseUp(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        const coords = Utils.getCanvasCoordinates(this.canvas, e);
        this.endDrawing(coords.x, coords.y);
    }

    /**
     * 触摸开始事件
     */
    handleTouchStart(e) {
        this.isDrawing = true;
        const coords = Utils.getCanvasCoordinates(this.canvas, e);
        this.startDrawing(coords.x, coords.y);
    }

    /**
     * 触摸移动事件
     */
    handleTouchMove(e) {
        if (!this.isDrawing) return;
        const coords = Utils.getCanvasCoordinates(this.canvas, e);
        this.continueDrawing(coords.x, coords.y);
    }

    /**
     * 触摸结束事件
     */
    handleTouchEnd(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.endDrawing();
    }

    /**
     * 开始绘画
     */
    startDrawing(x, y) {
        // 由具体工具实现
        if (window.currentTool && window.currentTool.startDrawing) {
            window.currentTool.startDrawing(x, y, this.ctx);
        }
    }

    /**
     * 继续绘画
     */
    continueDrawing(x, y) {
        // 由具体工具实现
        if (window.currentTool && window.currentTool.continueDrawing) {
            window.currentTool.continueDrawing(x, y, this.ctx);
        }
    }

    /**
     * 结束绘画
     */
    endDrawing(x, y) {
        // 由具体工具实现
        if (window.currentTool && window.currentTool.endDrawing) {
            window.currentTool.endDrawing(x, y, this.ctx);
        }
        
        // 保存状态到历史记录
        this.saveState();
    }

    /**
     * 清空画布
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置背景色
        this.ctx.fillStyle = this.backgroundColor || '#8B0000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 如果显示网格，绘制网格
        if (this.showGrid) {
            this.drawGrid();
        }
    }

    /**
     * 设置背景颜色
     */
    setBackgroundColor(color) {
        this.backgroundColor = color;
        this.clearCanvas();
        this.saveState();
    }

    /**
     * 绘制网格
     */
    drawGrid() {
        const gridSize = 20;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#FFE4E1';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.5;
        
        // 绘制垂直线
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    /**
     * 切换网格显示
     */
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.redraw();
    }

    /**
     * 重绘画布
     */
    redraw() {
        // 保存当前画布内容（不包括图像层）
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // 清空并重绘背景
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 如果显示网格，先绘制网格
        if (this.showGrid) {
            this.drawGrid();
        }
        
        // 恢复画布内容
        this.ctx.putImageData(imageData, 0, 0);
        
        // 绘制图像层
        if (window.imageTool) {
            window.imageTool.draw(this.ctx);
        }
    }

    /**
     * 保存当前状态到历史记录
     */
    saveState() {
        // 防抖处理，避免频繁保存
        if (this.saveStateTimeout) {
            clearTimeout(this.saveStateTimeout);
        }
        
        this.saveStateTimeout = setTimeout(() => {
            // 移除当前索引之后的历史记录
            this.history = this.history.slice(0, this.historyIndex + 1);
            
            // 添加新状态
            const imageData = this.canvas.toDataURL();
            
            // 避免保存重复状态
            if (this.history.length === 0 || this.history[this.history.length - 1] !== imageData) {
                this.history.push(imageData);
                this.historyIndex++;
                
                // 限制历史记录大小
                if (this.history.length > this.maxHistorySize) {
                    this.history.shift();
                    this.historyIndex--;
                }
                
                // 更新撤销/重做按钮状态
                this.updateUndoRedoButtons();
            }
        }, 100); // 100ms防抖
    }

    /**
     * 撤销操作
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadState(this.history[this.historyIndex]);
            this.updateUndoRedoButtons();
            Utils.showNotification('撤销成功 ↶', 'info', 1000);
        }
    }

    /**
     * 重做操作
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadState(this.history[this.historyIndex]);
            this.updateUndoRedoButtons();
            Utils.showNotification('重做成功 ↷', 'info', 1000);
        }
    }

    /**
     * 加载指定状态
     */
    loadState(imageData) {
        const img = new Image();
        img.onload = () => {
            this.clearCanvas();
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = imageData;
    }

    /**
     * 更新撤销/重做按钮状态
     */
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.disabled = this.historyIndex <= 0;
            undoBtn.style.opacity = undoBtn.disabled ? '0.5' : '1';
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.historyIndex >= this.history.length - 1;
            redoBtn.style.opacity = redoBtn.disabled ? '0.5' : '1';
        }
    }

    /**
     * 获取画布图像数据
     */
    getImageData() {
        return this.canvas.toDataURL();
    }

    /**
     * 获取画布Blob数据
     */
    getBlob(callback, type = 'image/png', quality = 1.0) {
        this.canvas.toBlob(callback, type, quality);
    }

    /**
     * 设置画布大小
     */
    setSize(width, height) {
        // 保存当前内容
        const imageData = this.getImageData();
        
        // 设置新尺寸
        this.canvas.width = width;
        this.canvas.height = height;
        
        // 重新初始化
        this.init();
        
        // 如果有内容，尝试恢复
        if (imageData && imageData !== this.canvas.toDataURL()) {
            this.loadState(imageData);
        }
    }

    /**
     * 获取指定位置的像素颜色
     */
    getPixelColor(x, y) {
        const imageData = this.ctx.getImageData(x, y, 1, 1);
        const data = imageData.data;
        return {
            r: data[0],
            g: data[1],
            b: data[2],
            a: data[3]
        };
    }

    /**
     * 油漆桶填充算法（Flood Fill）
     */
    floodFill(startX, startY, fillColor, tolerance = 0) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 获取起始点颜色
        const startColor = this.getPixelColor(startX, startY);
        const fillRgb = Utils.hexToRgb(fillColor);
        
        // 如果颜色相同，不需要填充
        if (this.colorsMatch(startColor, fillRgb, tolerance)) {
            return;
        }
        
        // 使用栈进行非递归填充
        const stack = [{x: startX, y: startY}];
        const visited = new Set();
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
                continue;
            }
            
            const currentColor = this.getPixelColor(x, y);
            if (!this.colorsMatch(currentColor, startColor, tolerance)) {
                continue;
            }
            
            visited.add(key);
            
            // 设置像素颜色
            const index = (y * width + x) * 4;
            data[index] = fillRgb.r;
            data[index + 1] = fillRgb.g;
            data[index + 2] = fillRgb.b;
            data[index + 3] = 255;
            
            // 添加相邻像素到栈
            stack.push({x: x + 1, y});
            stack.push({x: x - 1, y});
            stack.push({x, y: y + 1});
            stack.push({x, y: y - 1});
        }
        
        // 应用填充结果
        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * 检查两个颜色是否匹配（考虑容差）
     */
    colorsMatch(color1, color2, tolerance) {
        return Math.abs(color1.r - color2.r) <= tolerance &&
               Math.abs(color1.g - color2.g) <= tolerance &&
               Math.abs(color1.b - color2.b) <= tolerance;
    }

    /**
     * 导出画布为图片
     */
    exportAsImage(filename, format = 'png', quality = 1.0) {
        Utils.downloadCanvasAsImage(this.canvas, filename, format, quality);
        Utils.showNotification(`图片已导出: ${filename}`, 'success');
    }

    /**
     * 销毁画布管理器
     */
    destroy() {
        // 移除事件监听器
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        
        // 清空历史记录
        this.history = [];
        this.historyIndex = -1;
    }
}

// 导出画布管理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasManager;
} else {
    window.CanvasManager = CanvasManager;
}