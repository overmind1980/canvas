/**
 * 洞穴画 - 主应用文件
 * 初始化所有组件并启动画板应用
 */

class CaveCanvasApp {
    constructor() {
        this.isInitialized = false;
        this.managers = {};
        this.settings = null;
        
        // 等待DOM加载完成后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * 初始化应用
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🔥 初始化洞穴画...');
            
            // 显示加载动画
            this.showLoadingScreen();
            
            // 初始化存储管理器
            await this.initStorageManager();
            
            // 加载应用设置
            await this.loadSettings();
            
            // 初始化画布管理器
            await this.initCanvasManager();
            
            // 初始化工具管理器
            await this.initToolManager();
            
            // 初始化UI管理器
            await this.initUIManager();
            
            // 应用设置
            await this.applySettings();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 启动自动保存
            this.startAutoSave();
            
            // 隐藏加载动画
            this.hideLoadingScreen();
            
            // 显示欢迎消息
            this.showWelcomeMessage();
            
            this.isInitialized = true;
            console.log('✅ 洞穴画初始化完成！');
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showErrorMessage('应用初始化失败，请刷新页面重试。');
        }
    }

    /**
     * 显示加载屏幕
     */
    showLoadingScreen() {
        const loadingHTML = `
            <div id="loadingScreen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #2F1B14, #3E2723, #5D4037);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: 'Comic Sans MS', cursive;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    border: 4px solid #8B4513;
                    border-top: 4px solid transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                "></div>
                <h2 style="color: #D4A574; margin: 0; font-size: 24px;">🔥 洞穴画</h2>
                <p style="color: #A0522D; margin: 10px 0 0 0; font-size: 16px;">正在加载中...</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }

    /**
     * 隐藏加载屏幕
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
    }

    /**
     * 初始化存储管理器
     */
    async initStorageManager() {
        this.managers.storage = new StorageManager();
        window.storageManager = this.managers.storage;
        
        if (!this.managers.storage.isStorageSupported()) {
            Utils.showNotification('⚠️ 浏览器不支持本地存储，作品将无法保存', 'warning', 5000);
        }
    }

    /**
     * 加载应用设置
     */
    async loadSettings() {
        this.settings = this.managers.storage.getSettings();
        window.appSettings = this.settings;
    }

    /**
     * 初始化画布管理器
     */
    async initCanvasManager() {
        const canvas = document.getElementById('canvas');
        const previewCanvas = document.getElementById('previewCanvas');
        
        if (!canvas || !previewCanvas) {
            throw new Error('画布元素未找到');
        }
        
        this.managers.canvas = new CanvasManager(canvas, previewCanvas);
        window.canvasManager = this.managers.canvas;
        
        // 设置画布大小
        if (this.settings.canvasWidth && this.settings.canvasHeight) {
            this.managers.canvas.setSize(
                this.settings.canvasWidth,
                this.settings.canvasHeight
            );
        }
    }

    /**
     * 初始化工具管理器
     */
    async initToolManager() {
        this.managers.tool = new ToolManager(this.managers.canvas);
        window.toolManager = this.managers.tool;
        
        // 初始化图像工具
        this.managers.imageTool = new ImageTool(this.managers.canvas);
        window.imageTool = this.managers.imageTool;
        
        // 设置默认工具
        this.managers.tool.switchTool(this.settings.defaultTool);
    }

    /**
     * 初始化UI管理器
     */
    async initUIManager() {
        this.managers.ui = new UIManager();
        window.uiManager = this.managers.ui;
    }

    /**
     * 应用设置
     */
    async applySettings() {
        // 应用画笔设置
        if (window.brushSettings) {
            window.brushSettings.color = this.settings.brushColor;
            window.brushSettings.size = this.settings.brushSize;
            window.brushSettings.opacity = this.settings.brushOpacity;
            window.brushSettings.hardness = this.settings.brushHardness;
        }
        
        // 应用画布背景色
        if (this.managers.canvas) {
            this.managers.canvas.setBackgroundColor(this.settings.backgroundColor);
        }
        
        // 应用网格设置
        if (this.settings.showGrid && this.managers.canvas) {
            this.managers.canvas.toggleGrid();
        }
        
        // 更新UI元素
        this.updateUIFromSettings();
    }

    /**
     * 从设置更新UI元素
     */
    updateUIFromSettings() {
        // 更新颜色选择器
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.value = this.settings.brushColor;
        }
        
        // 更新滑块值
        const brushSizeSlider = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        if (brushSizeSlider && brushSizeValue) {
            brushSizeSlider.value = this.settings.brushSize;
            brushSizeValue.textContent = this.settings.brushSize;
        }
        
        const opacitySlider = document.getElementById('opacity');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider && opacityValue) {
            opacitySlider.value = this.settings.brushOpacity;
            opacityValue.textContent = this.settings.brushOpacity;
        }
        
        const hardnessSlider = document.getElementById('hardness');
        const hardnessValue = document.getElementById('hardnessValue');
        if (hardnessSlider && hardnessValue) {
            hardnessSlider.value = this.settings.brushHardness;
            hardnessValue.textContent = this.settings.brushHardness;
        }
        
        // 更新网格开关
        const gridToggle = document.getElementById('gridToggle');
        if (gridToggle) {
            gridToggle.checked = this.settings.showGrid;
        }
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 窗口大小改变事件
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleWindowResize();
        }, 250));
        
        // 页面卸载前保存
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });
        
        // 页面可见性改变
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // 错误处理
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });
        
        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    /**
     * 处理窗口大小改变
     */
    handleWindowResize() {
        if (this.managers.canvas) {
            // 可以在这里添加响应式画布大小调整逻辑
            console.log('窗口大小已改变');
        }
    }

    /**
     * 处理页面卸载前事件
     */
    handleBeforeUnload(e) {
        if (this.settings.autoSave && this.managers.canvas) {
            // 自动保存当前作品
            this.autoSaveCurrentArtwork();
        }
    }

    /**
     * 处理页面可见性改变
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时暂停一些操作
            this.pauseAutoSave();
        } else {
            // 页面显示时恢复操作
            this.resumeAutoSave();
        }
    }

    /**
     * 处理全局错误
     */
    handleGlobalError(e) {
        console.error('全局错误:', e.error);
        Utils.showNotification('发生了一个错误，请检查控制台', 'error');
    }

    /**
     * 处理未处理的Promise拒绝
     */
    handleUnhandledRejection(e) {
        console.error('未处理的Promise拒绝:', e.reason);
        e.preventDefault(); // 防止错误被抛到控制台
    }

    /**
     * 启动自动保存
     */
    startAutoSave() {
        if (!this.settings.autoSave) return;
        
        this.autoSaveInterval = setInterval(() => {
            this.autoSaveCurrentArtwork();
        }, this.settings.autoSaveInterval);
    }

    /**
     * 暂停自动保存
     */
    pauseAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * 恢复自动保存
     */
    resumeAutoSave() {
        if (this.settings.autoSave && !this.autoSaveInterval) {
            this.startAutoSave();
        }
    }

    /**
     * 自动保存当前作品
     */
    autoSaveCurrentArtwork() {
        if (!this.managers.canvas || !this.managers.storage) return;
        
        try {
            const imageData = this.managers.canvas.getImageData();
            
            // 检查画布是否为空
            if (this.isCanvasEmpty(imageData)) {
                return;
            }
            
            const autoSaveArtwork = {
                id: 'autosave_' + Date.now(),
                title: '自动保存_' + Utils.formatDateTime(new Date()),
                imageData: imageData,
                createdAt: new Date().toISOString(),
                isAutoSave: true
            };
            
            // 删除之前的自动保存
            this.cleanupAutoSaves();
            
            // 保存新的自动保存
            this.managers.storage.saveArtwork(autoSaveArtwork);
            
            console.log('自动保存完成');
        } catch (error) {
            console.error('自动保存失败:', error);
        }
    }

    /**
     * 检查画布是否为空
     */
    isCanvasEmpty(imageData) {
        // 创建一个临时画布来检查
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.managers.canvas.canvas.width;
        tempCanvas.height = this.managers.canvas.canvas.height;
        
        // 填充背景色
        tempCtx.fillStyle = this.settings.backgroundColor;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        const emptyImageData = tempCanvas.toDataURL();
        return imageData === emptyImageData;
    }

    /**
     * 清理自动保存的作品
     */
    cleanupAutoSaves() {
        if (!this.managers.storage) return;
        
        const artworks = this.managers.storage.getAllArtworks();
        const autoSaves = artworks.filter(artwork => artwork.isAutoSave);
        
        // 只保留最新的3个自动保存
        if (autoSaves.length > 3) {
            const toDelete = autoSaves
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(3);
            
            toDelete.forEach(artwork => {
                this.managers.storage.deleteArtwork(artwork.id);
            });
        }
    }

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        if (!this.settings.showWelcomeMessage) return;
        
        setTimeout(() => {
            const modal = Utils.createModal(
                '🔥 欢迎使用洞穴画！',
                `
                    <div style="text-align: left; line-height: 1.6;">
                        <p>✨ <strong>功能特色：</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>🖤 原始炭笔工具</li>
                            <li>🔥 暗红色洞穴画布</li>
                            <li>🎨 简约原始风格</li>
                            <li>💾 本地作品保存和管理</li>
                            <li>⌨️ 快捷键支持</li>
                        </ul>
                        <p>🎯 <strong>快捷键：</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Ctrl+S: 下载画作</li>
                            <li>G: 查看壁画集</li>
                        </ul>
                        <p style="margin-top: 15px;">现在开始你的创作之旅吧！ 🚀</p>
                    </div>
                `,
                [
                    { text: '不再显示', action: 'disable', class: 'cancel' },
                    { text: '开始创作', action: 'close', class: '' }
                ]
            );
            
            modal.addEventListener('modalAction', (e) => {
                if (e.detail.action === 'disable') {
                    this.settings.showWelcomeMessage = false;
                    this.managers.storage.saveSettings({ showWelcomeMessage: false });
                }
                Utils.hideModal(modal);
            });
        }, 1000);
    }

    /**
     * 显示错误消息
     */
    showErrorMessage(message) {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 10001;
                max-width: 400px;
            ">
                <h3 style="color: #FF1493; margin-bottom: 15px;">❌ 错误</h3>
                <p style="color: #666; margin-bottom: 20px;">${message}</p>
                <button onclick="location.reload()" style="
                    background: #FF69B4;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">刷新页面</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    /**
     * 获取应用状态
     */
    getAppState() {
        return {
            isInitialized: this.isInitialized,
            currentTool: this.managers.tool?.getCurrentTool(),
            canvasSize: {
                width: this.managers.canvas?.canvas.width,
                height: this.managers.canvas?.canvas.height
            },
            settings: this.settings,
            storageStats: this.managers.storage?.getArtworkStats()
        };
    }

    /**
     * 重置应用
     */
    reset() {
        // 清空画布
        if (this.managers.canvas) {
            this.managers.canvas.clearCanvas();
        }
        
        // 重置工具
        if (this.managers.tool) {
            this.managers.tool.switchTool('brush');
        }
        
        // 重置设置
        if (this.managers.storage) {
            this.managers.storage.resetSettings();
            this.settings = this.managers.storage.getSettings();
        }
        
        // 重新应用设置
        this.applySettings();
        
        Utils.showNotification('应用已重置 🔄', 'success');
    }

    /**
     * 销毁应用
     */
    destroy() {
        // 停止自动保存
        this.pauseAutoSave();
        
        // 销毁管理器
        Object.values(this.managers).forEach(manager => {
            if (manager && typeof manager.destroy === 'function') {
                manager.destroy();
            }
        });
        
        // 清理全局变量
        delete window.canvasManager;
        delete window.toolManager;
        delete window.uiManager;
        delete window.storageManager;
        delete window.appSettings;
        delete window.brushSettings;
        delete window.shapeSettings;
        delete window.bucketSettings;
        
        this.isInitialized = false;
        console.log('应用已销毁');
    }
}

// 创建并启动应用实例
let caveCanvasApp;

// 确保在DOM加载完成后启动应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        caveCanvasApp = new CaveCanvasApp();
    });
} else {
    caveCanvasApp = new CaveCanvasApp();
}

// 导出应用实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CaveCanvasApp;
} else {
    window.CaveCanvasApp = CaveCanvasApp;
    window.caveCanvasApp = caveCanvasApp;
}