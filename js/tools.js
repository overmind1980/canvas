/**
 * 二次元画板应用 - 绘画工具文件
 * 实现各种绘画工具的功能类
 */

// 基础工具类
class BaseTool {
    constructor(name) {
        this.name = name;
        this.isActive = false;
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    startDrawing(x, y, ctx) {
        // 子类实现
    }

    continueDrawing(x, y, ctx) {
        // 子类实现
    }

    endDrawing(x, y, ctx) {
        // 子类实现
    }
}

// 画笔工具
class BrushTool extends BaseTool {
    constructor() {
        super('brush');
        this.lastX = 0;
        this.lastY = 0;
        this.isDrawing = false;
    }

    startDrawing(x, y, ctx) {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        
        // 设置画笔属性
        const settings = window.brushSettings || {};
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = settings.color || '#FF69B4';
        ctx.lineWidth = settings.size || 5;
        ctx.globalAlpha = (settings.opacity || 100) / 100;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 应用硬度效果
        this.applyHardness(ctx, settings.hardness || 100);
        
        // 绘制起始点
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    continueDrawing(x, y, ctx) {
        if (!this.isDrawing) return;
        
        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        this.lastX = x;
        this.lastY = y;
    }

    endDrawing(x, y, ctx) {
        this.isDrawing = false;
        ctx.globalAlpha = 1.0;
    }

    /**
     * 应用画笔硬度效果
     */
    applyHardness(ctx, hardness) {
        // 硬度为0时最大羽化，硬度为100时无羽化
        if (hardness === 0) {
            // 硬度0时最大羽化效果
            const blur = ctx.lineWidth * 0.8;
            ctx.shadowBlur = blur;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.globalAlpha = Math.max(0.3, ctx.globalAlpha * 0.7);
        } else if (hardness < 100) {
            // 1-99硬度时的羽化效果
            const blur = (100 - hardness) * ctx.lineWidth * 0.01;
            ctx.shadowBlur = blur;
            ctx.shadowColor = ctx.strokeStyle;
            // 确保有一定的不透明度
            ctx.globalAlpha = Math.max(0.5, ctx.globalAlpha * (hardness / 100 + 0.3));
        } else {
            // 硬度100时无羽化
            ctx.shadowBlur = 0;
        }
    }
    
    /**
     * 调整颜色透明度
     */
    adjustColorAlpha(color, alpha) {
        if (color.startsWith('#')) {
            const rgb = this.hexToRgb(color);
            return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : `rgba(255, 105, 180, ${alpha})`;
        } else if (color.startsWith('rgb')) {
            return color.replace(/rgba?\(([^)]+)\)/, (match, values) => {
                const parts = values.split(',').map(v => v.trim());
                return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
            });
        }
        return `rgba(255, 105, 180, ${alpha})`;
    }
    
    /**
     * 十六进制颜色转RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

// 橡皮擦工具
class EraserTool extends BaseTool {
    constructor() {
        super('eraser');
        this.lastX = 0;
        this.lastY = 0;
        this.isDrawing = false;
    }

    startDrawing(x, y, ctx) {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        
        // 设置橡皮擦属性
        const settings = window.brushSettings || {};
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = settings.size || 10;
        ctx.globalAlpha = (settings.opacity || 100) / 100;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 应用硬度效果
        this.applyEraserHardness(ctx, settings.hardness || 100);
        
        // 擦除起始点
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    continueDrawing(x, y, ctx) {
        if (!this.isDrawing) return;
        
        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        this.lastX = x;
        this.lastY = y;
    }

    endDrawing(x, y, ctx) {
        this.isDrawing = false;
        ctx.restore();
    }
    
    /**
     * 应用橡皮擦硬度效果
     */
    applyEraserHardness(ctx, hardness) {
        // 硬度为0时最大羽化，硬度为100时无羽化
        if (hardness === 0) {
            // 硬度0时最大羽化效果
            const blur = ctx.lineWidth * 0.8;
            ctx.shadowBlur = blur;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.globalAlpha = Math.max(0.3, ctx.globalAlpha * 0.7);
        } else if (hardness < 100) {
            // 1-99硬度时的羽化效果
            const blur = (100 - hardness) * ctx.lineWidth * 0.01;
            ctx.shadowBlur = blur;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            // 确保有一定的不透明度
            ctx.globalAlpha = Math.max(0.5, ctx.globalAlpha * (hardness / 100 + 0.3));
        } else {
            // 硬度100时无羽化
            ctx.shadowBlur = 0;
        }
    }
}

// 油漆桶工具
class BucketTool extends BaseTool {
    constructor() {
        super('bucket');
    }

    startDrawing(x, y, ctx) {
        const settings = window.bucketSettings || {};
        const color = window.brushSettings?.color || '#FF69B4';
        const tolerance = settings.tolerance || 10;
        
        // 使用画布管理器的填充方法
        if (window.canvasManager) {
            window.canvasManager.floodFill(Math.floor(x), Math.floor(y), color, tolerance);
            Utils.showNotification('区域填充完成 🪣', 'success', 1500);
        }
    }

    continueDrawing(x, y, ctx) {
        // 油漆桶工具不需要连续绘制
    }

    endDrawing(x, y, ctx) {
        // 油漆桶工具不需要结束处理
    }
}

// 矩形工具
class RectangleTool extends BaseTool {
    constructor() {
        super('rectangle');
        this.startX = 0;
        this.startY = 0;
        this.isDrawing = false;
        this.previewCanvas = null;
    }

    startDrawing(x, y, ctx) {
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        
        // 创建预览层
        this.createPreviewCanvas(ctx.canvas);
    }

    continueDrawing(x, y, ctx) {
        if (!this.isDrawing || !this.previewCanvas) return;
        
        // 在预览层绘制矩形
        const previewCtx = this.previewCanvas.getContext('2d');
        previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        const settings = window.shapeSettings || {};
        this.drawRectangle(previewCtx, this.startX, this.startY, x, y, settings);
    }

    endDrawing(x, y, ctx) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // 在主画布绘制最终矩形
        const settings = window.shapeSettings || {};
        this.drawRectangle(ctx, this.startX, this.startY, x, y, settings);
        
        // 清理预览层
        this.removePreviewCanvas();
    }

    drawRectangle(ctx, startX, startY, endX, endY, settings) {
        const width = endX - startX;
        const height = endY - startY;
        
        ctx.save();
        
        // 填充
        if (settings.enableFill) {
            ctx.fillStyle = settings.fillColor || '#FFB6C1';
            ctx.fillRect(startX, startY, width, height);
        }
        
        // 描边
        ctx.strokeStyle = settings.strokeColor || '#FF69B4';
        ctx.lineWidth = settings.strokeWidth || 2;
        ctx.strokeRect(startX, startY, width, height);
        
        ctx.restore();
    }

    createPreviewCanvas(mainCanvas) {
        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.width = mainCanvas.width;
        this.previewCanvas.height = mainCanvas.height;
        this.previewCanvas.style.position = 'absolute';
        this.previewCanvas.style.top = mainCanvas.offsetTop + 'px';
        this.previewCanvas.style.left = mainCanvas.offsetLeft + 'px';
        this.previewCanvas.style.pointerEvents = 'none';
        this.previewCanvas.style.zIndex = '10';
        
        mainCanvas.parentNode.appendChild(this.previewCanvas);
    }

    removePreviewCanvas() {
        if (this.previewCanvas && this.previewCanvas.parentNode) {
            this.previewCanvas.parentNode.removeChild(this.previewCanvas);
            this.previewCanvas = null;
        }
    }
}

// 椭圆工具
class EllipseTool extends BaseTool {
    constructor() {
        super('ellipse');
        this.startX = 0;
        this.startY = 0;
        this.isDrawing = false;
        this.previewCanvas = null;
    }

    startDrawing(x, y, ctx) {
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        
        // 创建预览层
        this.createPreviewCanvas(ctx.canvas);
    }

    continueDrawing(x, y, ctx) {
        if (!this.isDrawing || !this.previewCanvas) return;
        
        // 在预览层绘制椭圆
        const previewCtx = this.previewCanvas.getContext('2d');
        previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        const settings = window.shapeSettings || {};
        this.drawEllipse(previewCtx, this.startX, this.startY, x, y, settings);
    }

    endDrawing(x, y, ctx) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // 在主画布绘制最终椭圆
        const settings = window.shapeSettings || {};
        this.drawEllipse(ctx, this.startX, this.startY, x, y, settings);
        
        // 清理预览层
        this.removePreviewCanvas();
    }

    drawEllipse(ctx, startX, startY, endX, endY, settings) {
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radiusX = Math.abs(endX - startX) / 2;
        const radiusY = Math.abs(endY - startY) / 2;
        
        ctx.save();
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        
        // 填充
        if (settings.enableFill) {
            ctx.fillStyle = settings.fillColor || '#FFB6C1';
            ctx.fill();
        }
        
        // 描边
        ctx.strokeStyle = settings.strokeColor || '#FF69B4';
        ctx.lineWidth = settings.strokeWidth || 2;
        ctx.stroke();
        
        ctx.restore();
    }

    createPreviewCanvas(mainCanvas) {
        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.width = mainCanvas.width;
        this.previewCanvas.height = mainCanvas.height;
        this.previewCanvas.style.position = 'absolute';
        this.previewCanvas.style.top = mainCanvas.offsetTop + 'px';
        this.previewCanvas.style.left = mainCanvas.offsetLeft + 'px';
        this.previewCanvas.style.pointerEvents = 'none';
        this.previewCanvas.style.zIndex = '10';
        
        mainCanvas.parentNode.appendChild(this.previewCanvas);
    }

    removePreviewCanvas() {
        if (this.previewCanvas && this.previewCanvas.parentNode) {
            this.previewCanvas.parentNode.removeChild(this.previewCanvas);
            this.previewCanvas = null;
        }
    }
}

// 三角形工具
class TriangleTool extends BaseTool {
    constructor() {
        super('triangle');
        this.startX = 0;
        this.startY = 0;
        this.isDrawing = false;
        this.previewCanvas = null;
    }

    startDrawing(x, y, ctx) {
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        
        // 创建预览层
        this.createPreviewCanvas(ctx.canvas);
    }

    continueDrawing(x, y, ctx) {
        if (!this.isDrawing || !this.previewCanvas) return;
        
        // 在预览层绘制三角形
        const previewCtx = this.previewCanvas.getContext('2d');
        previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        const settings = window.shapeSettings || {};
        this.drawTriangle(previewCtx, this.startX, this.startY, x, y, settings);
    }

    endDrawing(x, y, ctx) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // 在主画布绘制最终三角形
        const settings = window.shapeSettings || {};
        this.drawTriangle(ctx, this.startX, this.startY, x, y, settings);
        
        // 清理预览层
        this.removePreviewCanvas();
    }

    drawTriangle(ctx, startX, startY, endX, endY, settings) {
        const width = endX - startX;
        const height = endY - startY;
        
        // 计算三角形的三个顶点
        const topX = startX + width / 2;
        const topY = startY;
        const leftX = startX;
        const leftY = endY;
        const rightX = endX;
        const rightY = endY;
        
        ctx.save();
        
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.lineTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();
        
        // 填充
        if (settings.enableFill) {
            ctx.fillStyle = settings.fillColor || '#FFB6C1';
            ctx.fill();
        }
        
        // 描边
        ctx.strokeStyle = settings.strokeColor || '#FF69B4';
        ctx.lineWidth = settings.strokeWidth || 2;
        ctx.stroke();
        
        ctx.restore();
    }

    createPreviewCanvas(mainCanvas) {
        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.width = mainCanvas.width;
        this.previewCanvas.height = mainCanvas.height;
        this.previewCanvas.style.position = 'absolute';
        this.previewCanvas.style.top = mainCanvas.offsetTop + 'px';
        this.previewCanvas.style.left = mainCanvas.offsetLeft + 'px';
        this.previewCanvas.style.pointerEvents = 'none';
        this.previewCanvas.style.zIndex = '10';
        
        mainCanvas.parentNode.appendChild(this.previewCanvas);
    }

    removePreviewCanvas() {
        if (this.previewCanvas && this.previewCanvas.parentNode) {
            this.previewCanvas.parentNode.removeChild(this.previewCanvas);
            this.previewCanvas = null;
        }
    }
}

// 直线工具
class LineTool extends BaseTool {
    constructor() {
        super('line');
        this.startX = 0;
        this.startY = 0;
        this.isDrawing = false;
        this.previewCanvas = null;
    }

    startDrawing(x, y, ctx) {
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        
        // 创建预览层
        this.createPreviewCanvas(ctx.canvas);
    }

    continueDrawing(x, y, ctx) {
        if (!this.isDrawing || !this.previewCanvas) return;
        
        // 在预览层绘制直线
        const previewCtx = this.previewCanvas.getContext('2d');
        previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        const settings = window.shapeSettings || {};
        this.drawLine(previewCtx, this.startX, this.startY, x, y, settings);
    }

    endDrawing(x, y, ctx) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // 在主画布绘制最终直线
        const settings = window.shapeSettings || {};
        this.drawLine(ctx, this.startX, this.startY, x, y, settings);
        
        // 清理预览层
        this.removePreviewCanvas();
    }

    drawLine(ctx, startX, startY, endX, endY, settings) {
        ctx.save();
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        
        ctx.strokeStyle = settings.strokeColor || '#FF69B4';
        ctx.lineWidth = settings.strokeWidth || 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        ctx.restore();
    }

    createPreviewCanvas(mainCanvas) {
        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.width = mainCanvas.width;
        this.previewCanvas.height = mainCanvas.height;
        this.previewCanvas.style.position = 'absolute';
        this.previewCanvas.style.top = mainCanvas.offsetTop + 'px';
        this.previewCanvas.style.left = mainCanvas.offsetLeft + 'px';
        this.previewCanvas.style.pointerEvents = 'none';
        this.previewCanvas.style.zIndex = '10';
        
        mainCanvas.parentNode.appendChild(this.previewCanvas);
    }

    removePreviewCanvas() {
        if (this.previewCanvas && this.previewCanvas.parentNode) {
            this.previewCanvas.parentNode.removeChild(this.previewCanvas);
            this.previewCanvas = null;
        }
    }
}

// 工具管理器
class ToolManager {
    constructor() {
        this.tools = {
            brush: new BrushTool(),
            eraser: new EraserTool(),
            bucket: new BucketTool(),
            rectangle: new RectangleTool(),
            ellipse: new EllipseTool(),
            triangle: new TriangleTool(),
            line: new LineTool()
        };
        
        this.currentTool = 'brush'; // 改为字符串形式
        this.currentToolName = 'brush';
    }

    /**
     * 切换工具
     */
    switchTool(toolName) {
        // 停用当前工具
        if (this.tools[this.currentTool]) {
            this.tools[this.currentTool].deactivate();
        }
        
        // 更新当前工具
        this.currentTool = toolName;
        this.currentToolName = toolName;
        
        // 激活新工具（如果是传统绘画工具）
        if (this.tools[toolName]) {
            this.tools[toolName].activate();
            window.currentTool = this.tools[toolName];
        } else {
            window.currentTool = null;
        }
        
        Utils.showNotification(`已切换到 ${this.getToolDisplayName(toolName)} 工具`, 'info', 1500);
    }

    /**
     * 获取工具显示名称
     */
    getToolDisplayName(toolName) {
        const names = {
            brush: '🖌️ 画笔',
            eraser: '🧽 橡皮擦',
            bucket: '🪣 油漆桶',
            rectangle: '⬜ 矩形',
            ellipse: '⭕ 椭圆',
            triangle: '🔺 三角形',
            line: '📏 直线',
            image: '🖼️ 图像'
        };
        return names[toolName] || toolName;
    }

    /**
     * 获取当前工具
     */
    getCurrentTool() {
        return this.currentTool;
    }

    /**
     * 获取所有工具
     */
    getAllTools() {
        return this.tools;
    }
}

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseTool,
        BrushTool,
        EraserTool,
        BucketTool,
        RectangleTool,
        EllipseTool,
        TriangleTool,
        LineTool,
        ToolManager
    };
} else {
    window.BaseTool = BaseTool;
    window.BrushTool = BrushTool;
    window.EraserTool = EraserTool;
    window.BucketTool = BucketTool;
    window.RectangleTool = RectangleTool;
    window.EllipseTool = EllipseTool;
    window.TriangleTool = TriangleTool;
    window.LineTool = LineTool;
    window.ToolManager = ToolManager;
}