/**
 * 二次元画板应用 - UI管理文件
 * 处理用户界面交互和事件绑定
 */

class UIManager {
    constructor() {
        this.currentPage = 'canvas';
        this.isInitialized = false;
        this.artworksCache = []; // 缓存从服务器获取的作品
        
        // 初始化UI
        this.init();
    }

    /**
     * 初始化UI管理器
     */
    init() {
        if (this.isInitialized) return;
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化设置面板
        this.initSettingsPanels();
        
        // 初始化图像设置面板
        this.initImageSettings();
        
        // 初始化工具按钮状态
        this.initToolButtons();
        
        // 初始化颜色选择器
        this.initColorPicker();
        
        // 初始化滑块
        this.initSliders();
        
        // 初始化快捷键
        this.initKeyboardShortcuts();
        
        // 初始化移动端面板
        this.initMobilePanel();
        
        this.isInitialized = true;
        
        Utils.showNotification('🎨 画板已准备就绪！', 'success', 2000);
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 顶部操作按钮
        this.bindElement('undoBtn', 'click', () => {
            if (window.canvasManager) {
                window.canvasManager.undo();
            }
        });

        this.bindElement('redoBtn', 'click', () => {
            if (window.canvasManager) {
                window.canvasManager.redo();
            }
        });

        this.bindElement('clearBtn', 'click', () => {
            this.showClearConfirmation();
        });

        this.bindElement('saveBtn', 'click', () => {
            this.saveArtwork();
        });

        this.bindElement('exportBtn', 'click', () => {
            this.showExportDialog();
        });



        // 导航按钮
        this.bindElement('galleryBtn', 'click', () => {
            this.switchPage('gallery');
        });

        this.bindElement('helpBtn', 'click', () => {
            this.switchPage('help');
        });

        // 返回按钮
        this.bindElement('backToCanvas', 'click', () => {
            this.switchPage('canvas');
        });

        this.bindElement('backToCanvasFromHelp', 'click', () => {
            this.switchPage('canvas');
        });

        // 工具按钮
        this.bindToolButtons();

        // 网格切换
        this.bindElement('gridToggle', 'change', (e) => {
            if (window.canvasManager) {
                window.canvasManager.showGrid = e.target.checked;
                window.canvasManager.redraw();
                Utils.showNotification(e.target.checked ? '网格已显示 📐' : '网格已隐藏 📐', 'info', 1000);
            }
        });

        // 预设颜色
        this.bindPresetColors();
    }

    /**
     * 绑定元素事件的辅助方法
     */
    bindElement(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    /**
     * 绑定工具按钮事件
     */
    bindToolButtons() {
        // 绑定工具按钮事件
        document.getElementById('brushTool').addEventListener('click', () => this.selectTool('brush'));
        document.getElementById('eraserTool').addEventListener('click', () => this.selectTool('eraser'));
        document.getElementById('lineTool').addEventListener('click', () => this.selectTool('line'));
        document.getElementById('bucketTool').addEventListener('click', () => this.selectTool('bucket'));
        document.getElementById('imageTool').addEventListener('click', () => this.selectTool('image'));
        
        // 绑定形状工具按钮事件
        document.getElementById('rectangleTool').addEventListener('click', () => this.selectTool('rectangle'));
        document.getElementById('ellipseTool').addEventListener('click', () => this.selectTool('ellipse'));
        document.getElementById('triangleTool').addEventListener('click', () => this.selectTool('triangle'));
    }

    /**
     * 选择工具的统一方法
     */
    selectTool(toolName) {
        if (window.toolManager) {
            // 更新按钮状态
            const button = document.getElementById(toolName + 'Tool');
            if (button) {
                this.updateToolButtonState(button);
            }
            
            // 切换工具
            window.toolManager.switchTool(toolName);
            
            // 更新设置面板
            this.updateSettingsPanel(toolName);
        }
    }

    /**
     * 更新工具按钮状态
     */
    updateToolButtonState(activeButton) {
        // 移除所有按钮的激活状态
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 激活当前按钮
        activeButton.classList.add('active');
        
        // 添加动画效果
        activeButton.classList.add('bounce');
        setTimeout(() => {
            activeButton.classList.remove('bounce');
        }, 1000);
    }

    /**
     * 初始化工具按钮状态
     */
    initToolButtons() {
        // 默认激活画笔工具
        const brushButton = document.getElementById('brushTool');
        if (brushButton) {
            brushButton.classList.add('active');
        }
    }

    /**
     * 更新设置面板显示
     */
    updateSettingsPanel(toolName) {
        // 隐藏所有设置面板
        const panels = ['brushSettings', 'shapeSettings', 'bucketSettings', 'imageSettings'];
        panels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.style.display = 'none';
            }
        });

        // 显示对应的设置面板
        let targetPanel = 'brushSettings'; // 默认显示画笔设置
        
        if (['rectangle', 'ellipse', 'triangle', 'line'].includes(toolName)) {
            targetPanel = 'shapeSettings';
        } else if (toolName === 'bucket') {
            targetPanel = 'bucketSettings';
        } else if (toolName === 'image') {
            targetPanel = 'imageSettings';
        }

        const panel = document.getElementById(targetPanel);
        if (panel) {
            panel.style.display = 'block';
        }
    }

    /**
     * 初始化设置面板
     */
    initSettingsPanels() {
        // 初始化画笔设置
        window.brushSettings = {
            color: '#FF69B4',
            size: 5,
            opacity: 100,
            hardness: 100
        };

        // 初始化形状设置
        window.shapeSettings = {
            strokeColor: '#FF69B4',
            fillColor: '#FFB6C1',
            strokeWidth: 2,
            enableFill: false
        };

        // 初始化油漆桶设置
        window.bucketSettings = {
            tolerance: 10
        };
    }

    /**
      * 初始化图像设置面板
      */
    initImageSettings() {
        // 绑定图像上传按钮
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.loadImageFile(file);
                }
            });
        }

        // 绑定选择图像按钮
        const selectImageBtn = document.getElementById('selectImageBtn');
        if (selectImageBtn) {
            selectImageBtn.addEventListener('click', () => {
                imageUpload.click();
            });
        }

        // 绑定图像变换控制
        this.bindImageTransformControls();
    }

    /**
      * 绑定图像变换控制
      */
    bindImageTransformControls() {
        // 缩放控制
        const scaleSlider = document.getElementById('imageScale');
        if (scaleSlider) {
            scaleSlider.addEventListener('input', (e) => {
                if (window.imageTool) {
                    window.imageTool.updateTransform({ scale: parseFloat(e.target.value) });
                }
            });
        }

        // 旋转控制
        const rotationSlider = document.getElementById('imageRotation');
        if (rotationSlider) {
            rotationSlider.addEventListener('input', (e) => {
                if (window.imageTool) {
                    window.imageTool.updateTransform({ rotation: parseFloat(e.target.value) });
                }
            });
        }

        // 透明度控制
        const opacitySlider = document.getElementById('imageOpacity');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                if (window.imageTool) {
                    window.imageTool.updateTransform({ opacity: parseFloat(e.target.value) });
                }
            });
        }

        // 水平翻转
        const flipHBtn = document.getElementById('flipHorizontal');
        if (flipHBtn) {
            flipHBtn.addEventListener('click', () => {
                if (window.imageTool) {
                    window.imageTool.flipHorizontal();
                }
            });
        }

        // 垂直翻转
        const flipVBtn = document.getElementById('flipVertical');
        if (flipVBtn) {
            flipVBtn.addEventListener('click', () => {
                if (window.imageTool) {
                    window.imageTool.flipVertical();
                }
            });
        }

        // 重置变换
        const resetBtn = document.getElementById('resetTransform');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (window.imageTool) {
                    window.imageTool.resetTransform();
                    // 重置滑块值
                    if (scaleSlider) scaleSlider.value = 1;
                    if (rotationSlider) rotationSlider.value = 0;
                    if (opacitySlider) opacitySlider.value = 1;
                }
            });
        }

        // 移除图像
        const removeBtn = document.getElementById('removeImage');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (window.imageTool) {
                    window.imageTool.removeSelectedImage();
                }
            });
        }
    }

     /**
      * 加载图像文件
      */
    loadImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                if (window.imageTool) {
                    window.imageTool.addImage(img);
                    Utils.showNotification('图像已加载 🖼️', 'success');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * 初始化颜色选择器
     */
    initColorPicker() {
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('change', (e) => {
                const color = e.target.value;
                window.brushSettings.color = color;
                window.shapeSettings.strokeColor = color;
                
                // 更新硬度预览颜色
                this.updateHardnessPreview();
            });
        }

        // 形状颜色选择器
        const strokeColorPicker = document.getElementById('strokeColor');
        if (strokeColorPicker) {
            strokeColorPicker.addEventListener('change', (e) => {
                window.shapeSettings.strokeColor = e.target.value;
            });
        }

        const fillColorPicker = document.getElementById('fillColor');
        if (fillColorPicker) {
            fillColorPicker.addEventListener('change', (e) => {
                window.shapeSettings.fillColor = e.target.value;
            });
        }

        // 填充开关
        const enableFillCheckbox = document.getElementById('enableFill');
        if (enableFillCheckbox) {
            enableFillCheckbox.addEventListener('change', (e) => {
                window.shapeSettings.enableFill = e.target.checked;
            });
        }
        
        // 初始化自定义调色盘
        this.initCustomColorPalette();
    }

    /**
     * 初始化自定义调色盘
     */
    initCustomColorPalette() {
        // 创建自定义颜色存储
        this.customColors = JSON.parse(localStorage.getItem('customColors') || '[]');
        
        // 渲染自定义调色盘
        this.renderCustomColorPalette();
        
        // 绑定添加自定义颜色按钮
        const addColorBtn = document.getElementById('addToCustomColors');
        if (addColorBtn) {
            addColorBtn.addEventListener('click', () => {
                this.addCustomColor();
            });
        }
    }

    /**
     * 渲染自定义调色盘
     */
    renderCustomColorPalette() {
        const customColorsContainer = document.getElementById('customColors');
        if (!customColorsContainer) return;
        
        if (this.customColors.length === 0) {
            customColorsContainer.innerHTML = '';
            return;
        }
        
        customColorsContainer.innerHTML = this.customColors.map((color, index) => `
            <div class="custom-color" data-color="${color}" data-index="${index}" style="background-color: ${color}" title="${color}">
                <button class="remove-btn" data-index="${index}">×</button>
            </div>
        `).join('');
        
        // 绑定自定义颜色点击事件
        this.bindCustomColorEvents();
    }
    
    /**
     * 绑定自定义颜色事件
     */
    bindCustomColorEvents() {
        const customColors = document.querySelectorAll('#customColors .custom-color');
        customColors.forEach(colorElement => {
            // 点击颜色选择
            colorElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-btn')) {
                    const color = e.currentTarget.dataset.color;
                    this.selectCustomColor(color);
                }
            });
            
            // 点击删除按钮
            const removeBtn = colorElement.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.target.dataset.index);
                    this.removeCustomColor(index);
                });
            }
        });
    }

    /**
     * 添加自定义颜色
     */
    addCustomColor() {
        const colorPicker = document.getElementById('colorPicker');
        const currentColor = colorPicker ? colorPicker.value : '#FF69B4';
        
        // 检查颜色是否已存在
        if (this.customColors.includes(currentColor)) {
            Utils.showNotification('颜色已存在于调色盘中 🎨', 'warning');
            return;
        }
        
        // 限制最大数量
        if (this.customColors.length >= 20) {
            Utils.showNotification('自定义调色盘已满，请先删除一些颜色 🎨', 'warning');
            return;
        }
        
        // 添加颜色
        this.customColors.push(currentColor);
        this.saveCustomColors();
        this.renderCustomColorPalette();
        
        Utils.showNotification('颜色已添加到调色盘 ✨', 'success');
    }

    /**
     * 选择自定义颜色
     */
    selectCustomColor(color) {
        // 更新主颜色选择器
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.value = color;
        }
        
        // 更新设置
        window.brushSettings.color = color;
        window.shapeSettings.strokeColor = color;
        
        // 更新硬度预览
        this.updateHardnessPreview();
        
        Utils.showNotification(`已选择颜色 ${color} 🎨`, 'success', 1000);
    }

    /**
     * 移除自定义颜色
     */
    removeCustomColor(index) {
        if (index >= 0 && index < this.customColors.length) {
            this.customColors.splice(index, 1);
            this.saveCustomColors();
            this.renderCustomColorPalette();
            
            Utils.showNotification('颜色已从调色盘中移除 🗑️', 'success');
        }
    }

    /**
     * 保存自定义颜色到本地存储
     */
    saveCustomColors() {
        localStorage.setItem('customColors', JSON.stringify(this.customColors));
    }

    /**
     * 绑定预设颜色
     */
    bindPresetColors() {
        const presetColors = document.querySelectorAll('.preset-color');
        presetColors.forEach(colorElement => {
            colorElement.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                if (color) {
                    // 更新主颜色选择器
                    const colorPicker = document.getElementById('colorPicker');
                    if (colorPicker) {
                        colorPicker.value = color;
                    }
                    
                    // 更新设置
                    window.brushSettings.color = color;
                    window.shapeSettings.strokeColor = color;
                    
                    // 更新硬度预览
                    this.updateHardnessPreview();
                    
                    // 视觉反馈
                    e.target.classList.add('bounce');
                    setTimeout(() => {
                        e.target.classList.remove('bounce');
                    }, 300);
                }
            });
        });
    }

    /**
     * 初始化滑块
     */
    initSliders() {
        // 画笔大小滑块
        this.initSlider('brushSize', 'brushSizeValue', (value) => {
            window.brushSettings.size = parseInt(value);
        });

        // 透明度滑块
        this.initSlider('opacity', 'opacityValue', (value) => {
            window.brushSettings.opacity = parseInt(value);
        });

        // 硬度滑块
        this.initSlider('hardness', 'hardnessValue', (value) => {
            window.brushSettings.hardness = parseInt(value);
            this.updateHardnessPreview();
        });

        // 形状线条粗细滑块
        this.initSlider('strokeWidth', 'strokeWidthValue', (value) => {
            window.shapeSettings.strokeWidth = parseInt(value);
        });

        // 油漆桶容差滑块
        this.initSlider('tolerance', 'toleranceValue', (value) => {
            window.bucketSettings.tolerance = parseInt(value);
        });
    }

    /**
     * 初始化单个滑块
     */
    initSlider(sliderId, valueId, callback) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                valueDisplay.textContent = value;
                if (callback) {
                    callback(value);
                }
            });
        }
    }

    /**
     * 更新硬度预览
     */
    updateHardnessPreview() {
        const preview = document.getElementById('hardnessPreview');
        if (preview) {
            const hardness = window.brushSettings.hardness || 100;
            const color = window.brushSettings.color || '#FF69B4';
            const size = window.brushSettings.size || 5;
            
            preview.style.background = color;
            preview.style.width = size * 2 + 'px';
            preview.style.height = size * 2 + 'px';
            
            if (hardness < 100) {
                const blur = (100 - hardness) / 10;
                preview.style.filter = `blur(${blur}px)`;
            } else {
                preview.style.filter = 'none';
            }
        }
    }

    /**
     * 初始化键盘快捷键
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 防止在输入框中触发快捷键
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            // Ctrl+Shift+Z = 重做
                            if (window.canvasManager && window.canvasManager.historyIndex < window.canvasManager.history.length - 1) {
                                window.canvasManager.redo();
                            }
                        } else {
                            // Ctrl+Z = 撤销
                            if (window.canvasManager && window.canvasManager.historyIndex > 0) {
                                window.canvasManager.undo();
                            }
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        // Ctrl+Y = 重做
                        if (window.canvasManager) {
                            window.canvasManager.redo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        // Ctrl+S = 保存
                        this.saveArtwork();
                        break;
                }
            } else {
                switch (e.key) {
                    case 'Delete':
                        // Delete = 清空画布
                        this.showClearConfirmation();
                        break;
                    case '1':
                        // 数字键切换工具
                        this.switchToolByNumber(1);
                        break;
                    case '2':
                        this.switchToolByNumber(2);
                        break;
                    case '3':
                        this.switchToolByNumber(3);
                        break;
                    case '4':
                        this.switchToolByNumber(4);
                        break;
                }
            }
        });
    }

    /**
     * 通过数字键切换工具
     */
    switchToolByNumber(number) {
        const toolMap = {
            1: 'brush',
            2: 'eraser',
            3: 'bucket',
            4: 'rectangle'
        };

        const toolName = toolMap[number];
        if (toolName) {
            this.selectTool(toolName);
        }
    }

    /**
     * 页面切换
     */
    switchPage(pageName) {
        // 隐藏所有页面
        const pages = ['app', 'galleryPage', 'helpPage'];
        pages.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) {
                page.style.display = 'none';
            }
        });

        // 显示目标页面
        let targetPageId = 'app';
        if (pageName === 'gallery') {
            targetPageId = 'galleryPage';
            this.loadGallery();
        } else if (pageName === 'help') {
            targetPageId = 'helpPage';
        }

        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.style.display = 'block';
        }

        this.currentPage = pageName;
    }

    /**
     * 显示清空确认对话框
     */
    showClearConfirmation() {
        const modal = Utils.createModal(
            '🗑️ 清空画布',
            '确定要清空画布吗？此操作无法撤销。',
            [
                { text: '取消', action: 'close', class: 'cancel' },
                { text: '确定清空', action: 'confirm', class: '' }
            ]
        );

        modal.addEventListener('modalAction', (e) => {
            if (e.detail.action === 'confirm') {
                if (window.canvasManager) {
                    window.canvasManager.clearCanvas();
                    window.canvasManager.saveState();
                    Utils.showNotification('画布已清空 🗑️', 'success');
                }
                Utils.hideModal(modal);
            }
        });
    }

    /**
     * 保存作品
     */
    async saveArtwork() {
        if (window.canvasManager && window.storageManager) {
            const imageData = window.canvasManager.getImageData();
            const artwork = {
                id: Utils.generateId(),
                title: `作品_${Utils.formatDateTime(new Date()).replace(/[:\s-]/g, '_')}`,
                imageData: imageData,
                createdAt: new Date().toISOString(),
                thumbnail: await this.generateThumbnail(imageData)
            };

            // 保存到本地存储
            window.storageManager.saveArtwork(artwork);
            
            // 检测是否为Vercel环境或静态部署环境
            if (this.isStaticEnvironment()) {
                Utils.showNotification('作品已保存到本地 💾', 'success');
            } else {
                // 同时保存到服务器
                try {
                    await this.saveToServer(artwork);
                    Utils.showNotification('作品已保存到本地和服务器 💾✨', 'success');
                } catch (error) {
                    console.warn('服务器保存失败，但本地保存成功:', error);
                    Utils.showNotification('作品已保存到本地 💾 (服务器保存失败)', 'warning');
                }
            }
        }
    }

    /**
     * 检测是否为静态部署环境
     */
    isStaticEnvironment() {
        // 检测Vercel环境
        if (window.location.hostname.includes('vercel.app')) {
            return true;
        }
        
        // 检测Netlify环境
        if (window.location.hostname.includes('netlify.app')) {
            return true;
        }
        
        // 检测GitHub Pages环境
        if (window.location.hostname.includes('github.io')) {
            return true;
        }
        
        // 检测其他静态部署环境的特征
        if (window.location.protocol === 'file:' || 
            window.location.hostname === 'localhost' && window.location.port !== '3000') {
            return true;
        }
        
        return false;
    }

    /**
     * 保存作品到服务器
     */
    async saveToServer(artwork) {
        const response = await fetch('/api/artworks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: artwork.title,
                imageData: artwork.imageData,
                thumbnail: artwork.thumbnail,
                tags: artwork.tags || []
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '服务器保存失败');
        }

        return await response.json();
    }

    /**
     * 生成缩略图
     */
    generateThumbnail(imageData, maxWidth = 200, maxHeight = 150) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        return new Promise((resolve) => {
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL());
            };
            img.src = imageData;
        });
    }

    /**
     * 显示导出对话框
     */
    showExportDialog() {
        const modal = Utils.createModal(
            '📥 导出图片',
            `
                <div class="export-options">
                    <div class="setting-group">
                        <label>文件名:</label>
                        <input type="text" id="exportFilename" value="我的画作_${new Date().getTime()}" style="width: 100%; padding: 8px; border: 1px solid #FFB6C1; border-radius: 5px;">
                    </div>
                    <div class="setting-group">
                        <label>格式:</label>
                        <select id="exportFormat" style="width: 100%; padding: 8px; border: 1px solid #FFB6C1; border-radius: 5px;">
                            <option value="png">PNG (推荐)</option>
                            <option value="jpeg">JPEG</option>
                            <option value="webp">WebP</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>质量: <span id="qualityValue">100</span>%</label>
                        <input type="range" id="exportQuality" min="10" max="100" value="100" class="slider">
                    </div>
                </div>
            `,
            [
                { text: '取消', action: 'close', class: 'cancel' },
                { text: '导出', action: 'export', class: '' }
            ]
        );

        // 质量滑块事件
        const qualitySlider = modal.querySelector('#exportQuality');
        const qualityValue = modal.querySelector('#qualityValue');
        if (qualitySlider && qualityValue) {
            qualitySlider.addEventListener('input', (e) => {
                qualityValue.textContent = e.target.value;
            });
        }

        modal.addEventListener('modalAction', (e) => {
            if (e.detail.action === 'export') {
                const filename = modal.querySelector('#exportFilename').value || '我的画作';
                const format = modal.querySelector('#exportFormat').value;
                const quality = parseInt(modal.querySelector('#exportQuality').value) / 100;

                if (window.canvasManager) {
                    window.canvasManager.exportAsImage(`${filename}.${format}`, format, quality);
                }
                Utils.hideModal(modal);
            }
        });
    }

    /**
     * 加载作品画廊
     */
    async loadGallery() {
        const artworkGrid = document.getElementById('artworkGrid');
        if (!artworkGrid || !window.storageManager) return;

        // 显示加载状态
        artworkGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #FF69B4;">
                <h3>🎨 加载作品中...</h3>
                <p>请稍候</p>
            </div>
        `;

        let artworks = [];
        
        // 如果不是静态环境，尝试从服务器获取作品
        if (!this.isStaticEnvironment()) {
            try {
                const response = await fetch('/api/artworks');
                 if (response.ok) {
                     const result = await response.json();
                     if (result.success && result.data) {
                         const serverArtworks = result.data.map(artwork => ({
                             ...artwork,
                             imageData: `/api/artworks/${artwork.id}/image`,
                             thumbnail: `/api/artworks/${artwork.id}/thumbnail`
                         }));
                         console.log('从服务器获取到作品:', serverArtworks.length, '个');
                         artworks = serverArtworks;
                         this.artworksCache = serverArtworks; // 缓存服务器作品
                     } else {
                         console.warn('服务器响应格式错误');
                         artworks = window.storageManager.getAllArtworks();
                     }
                } else {
                    console.warn('服务器获取作品失败，使用本地存储');
                    artworks = window.storageManager.getAllArtworks();
                }
            } catch (error) {
                console.warn('服务器连接失败，使用本地存储:', error);
                artworks = window.storageManager.getAllArtworks();
            }
        } else {
            // 静态环境只使用本地存储
            artworks = window.storageManager.getAllArtworks();
        }
        
        if (artworks.length === 0) {
            artworkGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #FF69B4;">
                    <h3>🎨 还没有作品</h3>
                    <p>快去创作你的第一幅作品吧！</p>
                </div>
            `;
            return;
        }

        artworkGrid.innerHTML = artworks.map(artwork => `
            <div class="artwork-item" data-id="${artwork.id}">
                <div class="artwork-preview" style="background-image: url(${artwork.thumbnail || artwork.imageData}); background-size: cover; background-position: center;"></div>
                <div class="artwork-info">
                    <div class="artwork-title">${artwork.title}</div>
                    <div class="artwork-date">${new Date(artwork.createdAt).toLocaleDateString()}</div>
                    <div class="artwork-actions">
                        <button class="artwork-btn edit" data-action="edit" data-id="${artwork.id}">编辑</button>
                        <button class="artwork-btn delete" data-action="delete" data-id="${artwork.id}">删除</button>
                    </div>
                </div>
            </div>
        `).join('');

        // 绑定作品操作事件
        this.bindArtworkEvents();
    }

    /**
     * 绑定作品操作事件
     */
    bindArtworkEvents() {
        const artworkGrid = document.getElementById('artworkGrid');
        if (!artworkGrid) return;

        artworkGrid.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const artworkId = e.target.dataset.id;

            if (action === 'edit' && artworkId) {
                this.editArtwork(artworkId);
            } else if (action === 'delete' && artworkId) {
                this.deleteArtwork(artworkId);
            }
        });
    }

    /**
     * 编辑作品
     */
    async editArtwork(artworkId) {
        if (!window.canvasManager) return;
        
        let artwork = null;
        
        // 首先尝试从缓存中获取（服务器作品）
        if (this.artworksCache.length > 0) {
            artwork = this.artworksCache.find(item => item.id === artworkId);
        }
        
        // 如果缓存中没有，尝试从本地存储获取
        if (!artwork && window.storageManager) {
            artwork = window.storageManager.getArtwork(artworkId);
        }
        
        // 如果还是没有，尝试从服务器获取单个作品
         if (!artwork && !this.isStaticEnvironment()) {
             try {
                 const response = await fetch(`/api/artworks/${artworkId}`);
                 if (response.ok) {
                     const result = await response.json();
                     if (result.success && result.data) {
                         artwork = {
                             ...result.data,
                             imageData: `/api/artworks/${result.data.id}/image`,
                             thumbnail: `/api/artworks/${result.data.id}/thumbnail`
                         };
                     }
                 }
             } catch (error) {
                 console.warn('从服务器获取作品失败:', error);
             }
         }
        
        if (artwork) {
             // 如果imageData是URL（服务器作品），需要转换为base64
             if (artwork.imageData && artwork.imageData.startsWith('/api/')) {
                 try {
                     const imageResponse = await fetch(artwork.imageData);
                     if (imageResponse.ok) {
                         const blob = await imageResponse.blob();
                         const reader = new FileReader();
                         reader.onload = function(e) {
                             window.canvasManager.loadState(e.target.result);
                             Utils.showNotification('作品已加载到画布 🎨', 'success');
                         };
                         reader.readAsDataURL(blob);
                         this.switchPage('canvas');
                     } else {
                         Utils.showNotification('无法加载作品图片 ❌', 'error');
                     }
                 } catch (error) {
                     console.error('加载作品图片失败:', error);
                     Utils.showNotification('加载作品失败 ❌', 'error');
                 }
             } else {
                 // 本地作品，直接使用base64数据
                 window.canvasManager.loadState(artwork.imageData);
                 this.switchPage('canvas');
                 Utils.showNotification('作品已加载到画布 🎨', 'success');
             }
         } else {
             Utils.showNotification('无法找到该作品 ❌', 'error');
         }
    }

    /**
     * 删除作品
     */
    deleteArtwork(artworkId) {
        const modal = Utils.createModal(
            '🗑️ 删除作品',
            '确定要删除这幅作品吗？此操作无法撤销。',
            [
                { text: '取消', action: 'close', class: 'cancel' },
                { text: '确定删除', action: 'confirm', class: 'danger' }
            ]
        );

        modal.addEventListener('modalAction', async (e) => {
            if (e.detail.action === 'confirm') {
                let deleteSuccess = false;
                
                // 如果不是静态环境，尝试从服务器删除
                if (!this.isStaticEnvironment()) {
                    try {
                        const response = await fetch(`/api/artworks/${artworkId}`, {
                            method: 'DELETE'
                        });
                        if (response.ok) {
                            deleteSuccess = true;
                            // 从缓存中删除
                            this.artworksCache = this.artworksCache.filter(artwork => artwork.id !== artworkId);
                            console.log('从服务器删除作品成功');
                        } else {
                            console.warn('服务器删除作品失败');
                        }
                    } catch (error) {
                        console.warn('服务器删除作品失败:', error);
                    }
                }
                
                // 同时从本地存储删除（作为备份或静态环境）
                if (window.storageManager) {
                    const localDeleteSuccess = window.storageManager.deleteArtwork(artworkId);
                    if (!deleteSuccess) deleteSuccess = localDeleteSuccess;
                }
                
                if (deleteSuccess) {
                    this.loadGallery(); // 重新加载画廊
                    Utils.showNotification('作品已删除 🗑️', 'success');
                } else {
                    Utils.showNotification('删除作品失败 ❌', 'error');
                }
                
                Utils.hideModal(modal);
            }
        });
    }

    /**
     * 获取当前页面
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * 初始化移动端面板
     */
    initMobilePanel() {
        // 检查是否为移动设备
        const isMobile = window.innerWidth <= 768;
        if (!isMobile) return;

        const propertiesPanel = document.querySelector('.properties-panel');
        if (!propertiesPanel) return;

        // 创建面板切换按钮
        const toggleButton = document.createElement('div');
        toggleButton.className = 'mobile-panel-toggle';
        toggleButton.innerHTML = '⚙️ 工具设置';
        toggleButton.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: linear-gradient(135deg, #FF69B4, #FFB6C1);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 1001;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
            user-select: none;
            transition: all 0.3s ease;
        `;

        // 添加按钮到页面
        document.body.appendChild(toggleButton);

        // 初始状态：隐藏面板
        propertiesPanel.style.transform = 'translateY(100%)';
        propertiesPanel.style.transition = 'transform 0.3s ease';

        // 切换面板显示状态
        let isPanelVisible = false;
        toggleButton.addEventListener('click', () => {
            isPanelVisible = !isPanelVisible;
            if (isPanelVisible) {
                propertiesPanel.style.transform = 'translateY(0)';
                toggleButton.innerHTML = '✕ 关闭';
                toggleButton.style.background = 'linear-gradient(135deg, #FF1493, #FF69B4)';
            } else {
                propertiesPanel.style.transform = 'translateY(100%)';
                toggleButton.innerHTML = '⚙️ 工具设置';
                toggleButton.style.background = 'linear-gradient(135deg, #FF69B4, #FFB6C1)';
            }
        });

        // 点击面板外部关闭面板
        document.addEventListener('click', (e) => {
            if (isPanelVisible && 
                !propertiesPanel.contains(e.target) && 
                !toggleButton.contains(e.target)) {
                isPanelVisible = false;
                propertiesPanel.style.transform = 'translateY(100%)';
                toggleButton.innerHTML = '⚙️ 工具设置';
                toggleButton.style.background = 'linear-gradient(135deg, #FF69B4, #FFB6C1)';
            }
        });

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            const newIsMobile = window.innerWidth <= 768;
            if (!newIsMobile && toggleButton.parentNode) {
                // 切换到桌面模式时移除移动端按钮
                toggleButton.remove();
                propertiesPanel.style.transform = '';
                propertiesPanel.style.transition = '';
            } else if (newIsMobile && !toggleButton.parentNode) {
                // 切换到移动模式时重新添加按钮
                document.body.appendChild(toggleButton);
                propertiesPanel.style.transform = 'translateY(100%)';
                propertiesPanel.style.transition = 'transform 0.3s ease';
            }
        });
    }

    /**
     * 销毁UI管理器
     */
    destroy() {
        // 移除事件监听器
        document.removeEventListener('keydown', this.initKeyboardShortcuts);
        // 移除移动端面板按钮
        const toggleButton = document.querySelector('.mobile-panel-toggle');
        if (toggleButton) {
            toggleButton.remove();
        }
        this.isInitialized = false;
    }
}

// 导出UI管理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
} else {
    window.UIManager = UIManager;
}