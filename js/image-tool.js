/**
 * 二次元画板应用 - 图像工具类
 * 处理图像上传、显示、变换和交互功能
 */

class ImageTool {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.images = []; // 存储所有图像对象
        this.selectedImage = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.resizeHandle = null;
        
        // 图像设置
        this.settings = {
            scale: 100,
            rotation: 0,
            opacity: 100,
            flipHorizontal: false,
            flipVertical: false
        };
        
        this.init();
    }

    /**
     * 初始化图像工具
     */
    init() {
        this.bindEvents();
        this.initImageUpload();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 画布事件
        const canvas = this.canvasManager.canvas;
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        // 禁用右键菜单，避免干扰图像操作
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            console.log('右键菜单已禁用，请使用鼠标左键进行图像操作');
        });
        
        // 键盘事件
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * 初始化图像上传功能
     */
    initImageUpload() {
        const imageUpload = document.getElementById('imageUpload');
        const removeImage = document.getElementById('removeImage');
        
        // 图像上传事件
        if (imageUpload) {
            imageUpload.addEventListener('change', this.handleImageUpload.bind(this));
        }
        
        // 移除图像事件
        if (removeImage) {
            removeImage.addEventListener('click', this.removeSelectedImage.bind(this));
        }
        
        // 变换控制事件
        this.initTransformControls();
    }

    /**
     * 初始化变换控制
     */
    initTransformControls() {
        const opacitySlider = document.getElementById('imageOpacity');
        const flipHorizontal = document.getElementById('flipHorizontal');
        const flipVertical = document.getElementById('flipVertical');
        const resetTransform = document.getElementById('resetTransform');
        
        // 透明度控制
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                this.settings.opacity = parseInt(e.target.value);
                document.getElementById('imageOpacityValue').textContent = `${this.settings.opacity}%`;
                this.updateSelectedImage();
            });
        }
        
        // 翻转控制
        if (flipHorizontal) {
            flipHorizontal.addEventListener('click', () => {
                this.settings.flipHorizontal = !this.settings.flipHorizontal;
                this.updateSelectedImage();
            });
        }
        
        if (flipVertical) {
            flipVertical.addEventListener('click', () => {
                this.settings.flipVertical = !this.settings.flipVertical;
                this.updateSelectedImage();
            });
        }
        
        // 重置变换
        if (resetTransform) {
            resetTransform.addEventListener('click', () => {
                this.resetImageTransform();
            });
        }
    }

    /**
     * 处理图像上传
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            Utils.showNotification('请选择有效的图像文件 📸', 'error');
            return;
        }
        
        // 验证文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            Utils.showNotification('图像文件过大，请选择小于5MB的文件 📸', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.addImageToCanvas(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
        
        // 清空input以允许重复选择同一文件
        event.target.value = '';
    }

    /**
     * 添加图像到画布
     */
    addImageToCanvas(imageSrc, fileName) {
        const img = new Image();
        img.onload = () => {
            // 计算适合画布的尺寸
            const canvasRect = this.canvasManager.canvas.getBoundingClientRect();
            const maxWidth = canvasRect.width * 0.5;
            const maxHeight = canvasRect.height * 0.5;
            
            let width = img.width;
            let height = img.height;
            
            // 按比例缩放以适应画布
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            // 创建图像对象
            const imageObj = {
                id: Date.now() + Math.random(),
                image: img,
                fileName: fileName,
                x: (this.canvasManager.canvas.width - width) / 2,
                y: (this.canvasManager.canvas.height - height) / 2,
                width: width,
                height: height,
                originalWidth: width,
                originalHeight: height,
                scale: 100,
                rotation: 0,
                opacity: 100,
                flipHorizontal: false,
                flipVertical: false,
                selected: false
            };
            
            // 添加到图像列表
            this.images.push(imageObj);
            
            // 选中新添加的图像
            this.selectImage(imageObj);
            
            // 更新预览
            this.updateImagePreview(imageSrc, fileName);
            
            // 重绘画布
            this.canvasManager.redraw();
            
            Utils.showNotification(`图像 "${fileName}" 已添加到画布 🖼️`, 'success');
        };
        
        img.onerror = () => {
            Utils.showNotification('图像加载失败，请尝试其他文件 ❌', 'error');
        };
        
        img.src = imageSrc;
    }

    /**
     * 更新图像预览
     */
    updateImagePreview(imageSrc, fileName) {
        const previewContainer = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const controlsContainer = document.getElementById('imageControls');
        
        if (previewContainer && previewImage) {
            previewImage.src = imageSrc;
            previewImage.title = fileName;
            previewContainer.style.display = 'block';
            controlsContainer.style.display = 'block';
        }
    }

    /**
     * 选中图像
     */
    selectImage(imageObj) {
        // 取消之前的选中状态
        this.images.forEach(img => img.selected = false);
        
        // 选中当前图像
        if (imageObj) {
            imageObj.selected = true;
            this.selectedImage = imageObj;
            
            // 更新控制面板
            this.updateControlPanel(imageObj);
        } else {
            this.selectedImage = null;
        }
        
        this.canvasManager.redraw();
    }

    /**
     * 更新控制面板
     */
    updateControlPanel(imageObj) {
        const scaleSlider = document.getElementById('imageScale');
        const rotationSlider = document.getElementById('imageRotation');
        const opacitySlider = document.getElementById('imageOpacity');
        
        if (scaleSlider) {
            scaleSlider.value = imageObj.scale;
            document.getElementById('imageScaleValue').textContent = `${imageObj.scale}%`;
        }
        
        if (rotationSlider) {
            rotationSlider.value = imageObj.rotation;
            document.getElementById('imageRotationValue').textContent = `${imageObj.rotation}°`;
        }
        
        if (opacitySlider) {
            opacitySlider.value = imageObj.opacity;
            document.getElementById('imageOpacityValue').textContent = `${imageObj.opacity}%`;
        }
        
        // 同步设置
        this.settings = {
            scale: imageObj.scale,
            rotation: imageObj.rotation,
            opacity: imageObj.opacity,
            flipHorizontal: imageObj.flipHorizontal,
            flipVertical: imageObj.flipVertical
        };
    }

    /**
     * 更新选中的图像
     */
    updateSelectedImage() {
        if (!this.selectedImage) return;
        
        // 更新图像属性
        this.selectedImage.scale = this.settings.scale;
        this.selectedImage.rotation = this.settings.rotation;
        this.selectedImage.opacity = this.settings.opacity;
        this.selectedImage.flipHorizontal = this.settings.flipHorizontal;
        this.selectedImage.flipVertical = this.settings.flipVertical;
        
        // 重新计算尺寸
        const scaleRatio = this.settings.scale / 100;
        this.selectedImage.width = this.selectedImage.originalWidth * scaleRatio;
        this.selectedImage.height = this.selectedImage.originalHeight * scaleRatio;
        
        // 清除画布并重绘，确保虚线边框正确更新
        this.canvasManager.clearCanvas();
        this.canvasManager.redraw();
    }

    /**
     * 重置图像变换
     */
    resetImageTransform() {
        if (!this.selectedImage) return;
        
        this.settings = {
            scale: 100,
            rotation: 0,
            opacity: 100,
            flipHorizontal: false,
            flipVertical: false
        };
        
        // 更新控制面板
        this.updateControlPanel({
            scale: 100,
            rotation: 0,
            opacity: 100,
            flipHorizontal: false,
            flipVertical: false
        });
        
        // 更新图像
        this.updateSelectedImage();
        
        Utils.showNotification('图像变换已重置 🔄', 'success');
    }

    /**
     * 添加图像（兼容UI调用）
     */
    addImage(img) {
        // 计算适合画布的尺寸
        const canvasRect = this.canvasManager.canvas.getBoundingClientRect();
        const maxWidth = canvasRect.width * 0.5;
        const maxHeight = canvasRect.height * 0.5;
        
        let width = img.width;
        let height = img.height;
        
        // 按比例缩放以适应画布
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        // 创建图像对象
        const imageObj = {
            id: Date.now() + Math.random(),
            image: img,
            fileName: 'uploaded-image.png',
            x: (this.canvasManager.canvas.width - width) / 2,
            y: (this.canvasManager.canvas.height - height) / 2,
            width: width,
            height: height,
            originalWidth: width,
            originalHeight: height,
            scale: 100,
            rotation: 0,
            opacity: 100,
            flipHorizontal: false,
            flipVertical: false,
            selected: false
        };
        
        this.images.push(imageObj);
        
        // 选中新添加的图像
        this.selectImage(imageObj);
        
        // 重绘画布
        this.canvasManager.redraw();
    }

    /**
     * 更新变换（兼容UI调用）
     */
    updateTransform(transform) {
        if (!this.selectedImage) return;
        
        if (transform.scale !== undefined) {
            this.settings.scale = transform.scale;
            this.selectedImage.scale = transform.scale;
            const scaleRatio = transform.scale / 100;
            this.selectedImage.width = this.selectedImage.originalWidth * scaleRatio;
            this.selectedImage.height = this.selectedImage.originalHeight * scaleRatio;
        }
        
        if (transform.rotation !== undefined) {
            this.settings.rotation = transform.rotation;
            this.selectedImage.rotation = transform.rotation;
        }
        
        if (transform.opacity !== undefined) {
            this.settings.opacity = transform.opacity;
            this.selectedImage.opacity = transform.opacity;
        }
        
        // 清除画布并重绘，确保虚线边框正确更新
        this.canvasManager.clearCanvas();
        this.canvasManager.redraw();
    }

    /**
     * 水平翻转
     */
    flipHorizontal() {
        if (!this.selectedImage) return;
        
        this.settings.flipHorizontal = !this.settings.flipHorizontal;
        this.selectedImage.flipHorizontal = this.settings.flipHorizontal;
        
        // 清除画布并重绘，确保虚线边框正确更新
        this.canvasManager.clearCanvas();
        this.canvasManager.redraw();
    }

    /**
     * 垂直翻转
     */
    flipVertical() {
        if (!this.selectedImage) return;
        
        this.settings.flipVertical = !this.settings.flipVertical;
        this.selectedImage.flipVertical = this.settings.flipVertical;
        
        // 清除画布并重绘，确保虚线边框正确更新
        this.canvasManager.clearCanvas();
        this.canvasManager.redraw();
    }

    /**
     * 重置变换（兼容UI调用）
     */
    resetTransform() {
        this.resetImageTransform();
    }

    /**
     * 移除选中的图像
     */
    removeSelectedImage() {
        if (!this.selectedImage) return;
        
        const index = this.images.indexOf(this.selectedImage);
        if (index > -1) {
            this.images.splice(index, 1);
            this.selectedImage = null;
            
            // 隐藏预览和控制面板
            const previewContainer = document.getElementById('imagePreview');
            const controlsContainer = document.getElementById('imageControls');
            if (previewContainer) previewContainer.style.display = 'none';
            if (controlsContainer) controlsContainer.style.display = 'none';
            
            // 重绘画布
            this.canvasManager.redraw();
            
            Utils.showNotification('图像已移除 🗑️', 'success');
        }
    }

    /**
     * 鼠标按下事件处理
     */
    handleMouseDown(event) {
        if (window.toolManager.currentTool !== 'image') return;
        
        // 只响应鼠标左键点击 (button === 0)
        if (event.button !== 0) {
            console.log('非左键点击，忽略事件。按键:', event.button);
            return;
        }
        
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        console.log('鼠标左键按下位置:', { x, y });
        
        // 优先检查当前选中图像的控制点（包括旋转控制点）
        if (this.selectedImage) {
            const handle = this.getControlHandle(x, y, this.selectedImage);
            console.log('检测选中图像的控制点:', handle);
            
            if (handle) {
                // 点击了控制点，开始变换操作
                this.isTransforming = true;
                this.transformHandle = handle;
                this.transformStartPos = { x, y };
                this.originalImageState = {
                    x: this.selectedImage.x,
                    y: this.selectedImage.y,
                    width: this.selectedImage.width,
                    height: this.selectedImage.height,
                    rotation: this.selectedImage.rotation || 0
                };
                
                console.log('开始变换操作:', handle, '起始位置:', { x, y }, '图像状态:', this.originalImageState);
                
                // 如果是旋转操作，立即更新光标并提供操作提示
                if (handle.startsWith('rotate')) {
                    this.canvasManager.canvas.style.cursor = 'grabbing';
                    console.log('开始旋转操作，光标已更新为grabbing');
                    console.log('提示：拖拽鼠标左键来旋转图像');
                }
                return; // 控制点操作优先，直接返回
            }
        }
        
        // 检查是否点击了图像
        const clickedImage = this.getImageAt(x, y);
        
        if (clickedImage) {
            this.selectImage(clickedImage);
            
            // 检查是否点击了新选中图像的控制点
            const handle = this.getControlHandle(x, y, clickedImage);
            console.log('检测到的控制点:', handle);
            
            if (handle) {
                this.isTransforming = true;
                this.transformHandle = handle;
                this.transformStartPos = { x, y };
                this.originalImageState = {
                    x: clickedImage.x,
                    y: clickedImage.y,
                    width: clickedImage.width,
                    height: clickedImage.height,
                    rotation: clickedImage.rotation || 0
                };
                
                console.log('开始变换操作:', handle, '起始位置:', { x, y }, '图像状态:', this.originalImageState);
                
                if (handle.startsWith('rotate')) {
                    this.canvasManager.canvas.style.cursor = 'grabbing';
                    console.log('开始旋转操作，光标已更新为grabbing');
                    console.log('提示：拖拽鼠标左键来旋转图像');
                }
            } else {
                // 普通拖拽移动
                this.isDragging = true;
                this.dragStartPos = {
                    x: x - clickedImage.x,
                    y: y - clickedImage.y
                };
                console.log('开始拖拽移动');
            }
        } else {
            // 点击空白区域，取消选择
            if (this.selectedImage) {
                this.selectedImage.selected = false;
                this.selectedImage = null;
                // 清理画布并重绘
                this.canvasManager.clearCanvas();
                this.canvasManager.redraw();
                console.log('取消图像选择');
            }
        }
    }

    /**
     * 鼠标移动事件处理
     */
    handleMouseMove(event) {
        if (window.toolManager.currentTool !== 'image') return;
        
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (this.isTransforming && this.selectedImage) {
            this.handleTransform(x, y);
        } else if (this.isDragging && this.selectedImage) {
            // 普通拖拽移动
            this.selectedImage.x = x - this.dragStartPos.x;
            this.selectedImage.y = y - this.dragStartPos.y;
            
            // 限制在画布范围内
            this.selectedImage.x = Math.max(0, Math.min(this.selectedImage.x, 
                this.canvasManager.canvas.width - this.selectedImage.width));
            this.selectedImage.y = Math.max(0, Math.min(this.selectedImage.y, 
                this.canvasManager.canvas.height - this.selectedImage.height));
            
            this.canvasManager.redraw();
        } else {
            // 更新光标样式
            this.updateCursor(x, y);
        }
    }

    /**
     * 处理变换操作
     */
    handleTransform(x, y) {
        const dx = x - this.transformStartPos.x;
        const dy = y - this.transformStartPos.y;
        
        if (this.transformHandle.startsWith('rotate')) {
            // 旋转操作 - 更新光标为旋转中状态
            this.canvasManager.canvas.style.cursor = 'grabbing';
            
            const centerX = this.originalImageState.x + this.originalImageState.width / 2;
            const centerY = this.originalImageState.y + this.originalImageState.height / 2;
            
            const startAngle = Math.atan2(this.transformStartPos.y - centerY, this.transformStartPos.x - centerX);
            const currentAngle = Math.atan2(y - centerY, x - centerX);
            
            let deltaAngle = (currentAngle - startAngle) * 180 / Math.PI;
            
            // 确保角度在0-360范围内
            let newRotation = (this.originalImageState.rotation + deltaAngle) % 360;
            if (newRotation < 0) newRotation += 360;
            
            this.selectedImage.rotation = newRotation;
            
            // 添加详细调试信息
            console.log('旋转操作详情:', {
                handle: this.transformHandle,
                center: { x: centerX, y: centerY },
                startPos: this.transformStartPos,
                currentPos: { x, y },
                startAngle: startAngle * 180 / Math.PI,
                currentAngle: currentAngle * 180 / Math.PI,
                deltaAngle: deltaAngle,
                originalRotation: this.originalImageState.rotation,
                newRotation: newRotation.toFixed(1) + '°'
            });
        } else {
            // 缩放操作
            let newWidth = this.originalImageState.width;
            let newHeight = this.originalImageState.height;
            let newX = this.originalImageState.x;
            let newY = this.originalImageState.y;
            
            switch (this.transformHandle) {
                case 'nw-resize':
                    newWidth = this.originalImageState.width - dx;
                    newHeight = this.originalImageState.height - dy;
                    newX = this.originalImageState.x + dx;
                    newY = this.originalImageState.y + dy;
                    break;
                case 'ne-resize':
                    newWidth = this.originalImageState.width + dx;
                    newHeight = this.originalImageState.height - dy;
                    newY = this.originalImageState.y + dy;
                    break;
                case 'sw-resize':
                    newWidth = this.originalImageState.width - dx;
                    newHeight = this.originalImageState.height + dy;
                    newX = this.originalImageState.x + dx;
                    break;
                case 'se-resize':
                    newWidth = this.originalImageState.width + dx;
                    newHeight = this.originalImageState.height + dy;
                    break;
                case 'n-resize':
                    newHeight = this.originalImageState.height - dy;
                    newY = this.originalImageState.y + dy;
                    break;
                case 's-resize':
                    newHeight = this.originalImageState.height + dy;
                    break;
                case 'w-resize':
                    newWidth = this.originalImageState.width - dx;
                    newX = this.originalImageState.x + dx;
                    break;
                case 'e-resize':
                    newWidth = this.originalImageState.width + dx;
                    break;
            }
            
            // 限制最小尺寸
            newWidth = Math.max(20, newWidth);
            newHeight = Math.max(20, newHeight);
            
            this.selectedImage.width = newWidth;
            this.selectedImage.height = newHeight;
            this.selectedImage.x = newX;
            this.selectedImage.y = newY;
        }
        
        this.canvasManager.redraw();
    }

    /**
     * 更新光标样式
     */
    updateCursor(x, y) {
        if (this.selectedImage) {
            const handle = this.getControlHandle(x, y, this.selectedImage);
            
            if (handle) {
                if (handle.startsWith('rotate')) {
                    // 使用更明显的旋转光标样式
                    this.canvasManager.canvas.style.cursor = 'grab';
                } else {
                    this.canvasManager.canvas.style.cursor = handle;
                }
            } else if (this.getImageAt(x, y) === this.selectedImage) {
                this.canvasManager.canvas.style.cursor = 'move';
            } else {
                this.canvasManager.canvas.style.cursor = 'default';
            }
        } else {
            const imageAt = this.getImageAt(x, y);
            this.canvasManager.canvas.style.cursor = imageAt ? 'pointer' : 'default';
        }
    }

    /**
     * 鼠标释放事件处理
     */
    handleMouseUp(event) {
        if (window.toolManager.currentTool !== 'image') return;
        
        this.isDragging = false;
        this.isTransforming = false;
        this.transformHandle = null;
        this.transformStartPos = null;
        this.originalImageState = null;
        
        // 操作完成后重绘画布，保持选中状态的控制点可见
        this.canvasManager.clearCanvas();
        this.canvasManager.redraw();
        
        // 更新光标但不重置为默认，保持交互状态
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.updateCursor(x, y);
    }

    /**
     * 双击事件处理
     */
    handleDoubleClick(event) {
        if (window.toolManager.currentTool !== 'image') return;
        
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const clickedImage = this.getImageAt(x, y);
        if (clickedImage) {
            // 双击图像时显示变换控制
            this.selectImage(clickedImage);
            Utils.showNotification('双击图像进入编辑模式 ✏️', 'info');
        }
    }

    /**
     * 键盘事件处理
     */
    handleKeyDown(event) {
        if (window.toolManager.currentTool !== 'image' || !this.selectedImage) return;
        
        switch (event.key) {
            case 'Delete':
            case 'Backspace':
                this.removeSelectedImage();
                event.preventDefault();
                break;
            case 'ArrowUp':
                this.selectedImage.y = Math.max(0, this.selectedImage.y - 1);
                this.canvasManager.redraw();
                event.preventDefault();
                break;
            case 'ArrowDown':
                this.selectedImage.y = Math.min(this.canvasManager.canvas.height - this.selectedImage.height, 
                    this.selectedImage.y + 1);
                this.canvasManager.redraw();
                event.preventDefault();
                break;
            case 'ArrowLeft':
                this.selectedImage.x = Math.max(0, this.selectedImage.x - 1);
                this.canvasManager.redraw();
                event.preventDefault();
                break;
            case 'ArrowRight':
                this.selectedImage.x = Math.min(this.canvasManager.canvas.width - this.selectedImage.width, 
                    this.selectedImage.x + 1);
                this.canvasManager.redraw();
                event.preventDefault();
                break;
        }
    }

    /**
     * 获取指定位置的图像
     */
    getImageAt(x, y) {
        // 从后往前遍历（最上层的图像优先）
        for (let i = this.images.length - 1; i >= 0; i--) {
            const img = this.images[i];
            
            // 图像中心
            const centerX = img.x + img.width / 2;
            const centerY = img.y + img.height / 2;
            
            // 将鼠标坐标转换到图像的本地坐标系
            let localX = x - centerX;
            let localY = y - centerY;
            
            // 反向应用旋转变换
            if (img.rotation !== 0) {
                const angle = -(img.rotation * Math.PI) / 180; // 反向旋转
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const rotatedX = localX * cos - localY * sin;
                const rotatedY = localX * sin + localY * cos;
                localX = rotatedX;
                localY = rotatedY;
            }
            
            // 反向应用翻转变换
            if (img.flipHorizontal) localX = -localX;
            if (img.flipVertical) localY = -localY;
            
            // 检查点是否在图像范围内（相对于中心）
            if (localX >= -img.width / 2 && localX <= img.width / 2 && 
                localY >= -img.height / 2 && localY <= img.height / 2) {
                return img;
            }
        }
        return null;
    }

    /**
     * 获取控制点类型
     */
    getControlHandle(x, y, imageObj) {
        const handleSize = 8;
        const rotateDistance = 25; // 与绘制时保持一致
        
        // 图像中心
        const centerX = imageObj.x + imageObj.width / 2;
        const centerY = imageObj.y + imageObj.height / 2;
        
        // 将鼠标坐标转换到图像的本地坐标系（考虑旋转和翻转）
        let localX = x - centerX;
        let localY = y - centerY;
        
        // 反向应用旋转变换
        if (imageObj.rotation !== 0) {
            const angle = -(imageObj.rotation * Math.PI) / 180; // 反向旋转
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const rotatedX = localX * cos - localY * sin;
            const rotatedY = localX * sin + localY * cos;
            localX = rotatedX;
            localY = rotatedY;
        }
        
        // 反向应用翻转变换
        if (imageObj.flipHorizontal) localX = -localX;
        if (imageObj.flipVertical) localY = -localY;
        
        // 图像边界（相对于中心）
        const left = -imageObj.width / 2;
        const right = imageObj.width / 2;
        const top = -imageObj.height / 2;
        const bottom = imageObj.height / 2;
        
        // 优先检查旋转控制点（在角落外侧），确保旋转优先级高于缩放
        const rotateHandles = [
            { x: left - rotateDistance, y: top - rotateDistance, type: 'rotate-nw' },
            { x: right + rotateDistance, y: top - rotateDistance, type: 'rotate-ne' },
            { x: left - rotateDistance, y: bottom + rotateDistance, type: 'rotate-sw' },
            { x: right + rotateDistance, y: bottom + rotateDistance, type: 'rotate-se' }
        ];
        
        // 检查旋转控制点
        for (const handle of rotateHandles) {
            if (this.isPointInHandle(localX, localY, handle.x, handle.y, handleSize)) {
                console.log('检测到旋转控制点:', handle.type, '本地坐标:', { x: localX, y: localY }, '控制点位置:', { x: handle.x, y: handle.y });
                return handle.type;
            }
        }
        
        // 检查角落控制点（缩放）
        if (this.isPointInHandle(localX, localY, left, top, handleSize)) {
            return 'nw-resize';
        }
        if (this.isPointInHandle(localX, localY, right, top, handleSize)) {
            return 'ne-resize';
        }
        if (this.isPointInHandle(localX, localY, left, bottom, handleSize)) {
            return 'sw-resize';
        }
        if (this.isPointInHandle(localX, localY, right, bottom, handleSize)) {
            return 'se-resize';
        }
        
        // 检查边缘控制点（缩放）
        if (this.isPointInHandle(localX, localY, (left + right) / 2, top, handleSize)) {
            return 'n-resize';
        }
        if (this.isPointInHandle(localX, localY, (left + right) / 2, bottom, handleSize)) {
            return 's-resize';
        }
        if (this.isPointInHandle(localX, localY, left, (top + bottom) / 2, handleSize)) {
            return 'w-resize';
        }
        if (this.isPointInHandle(localX, localY, right, (top + bottom) / 2, handleSize)) {
            return 'e-resize';
        }
        
        return null;
    }

    /**
     * 检查点是否在控制点范围内
     */
    isPointInHandle(x, y, handleX, handleY, handleSize) {
        // 增加旋转控制点的检测范围，使其更容易点击
        const detectSize = handleSize + 8; // 增加检测范围
        const distance = Math.sqrt((x - handleX) ** 2 + (y - handleY) ** 2);
        return distance <= detectSize;
    }

    /**
     * 绘制所有图像
     */
    draw(ctx) {
        this.images.forEach(imageObj => {
            this.drawImage(ctx, imageObj);
        });
    }

    /**
     * 绘制单个图像
     */
    drawImage(ctx, imageObj) {
        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = imageObj.opacity / 100;
        
        // 移动到图像中心进行变换
        const centerX = imageObj.x + imageObj.width / 2;
        const centerY = imageObj.y + imageObj.height / 2;
        
        ctx.translate(centerX, centerY);
        
        // 应用旋转
        if (imageObj.rotation !== 0) {
            ctx.rotate((imageObj.rotation * Math.PI) / 180);
        }
        
        // 应用翻转
        let scaleX = 1;
        let scaleY = 1;
        if (imageObj.flipHorizontal) scaleX = -1;
        if (imageObj.flipVertical) scaleY = -1;
        ctx.scale(scaleX, scaleY);
        
        // 绘制图像
        ctx.drawImage(
            imageObj.image,
            -imageObj.width / 2,
            -imageObj.height / 2,
            imageObj.width,
            imageObj.height
        );
        
        ctx.restore();
        
        // 绘制选中状态的边框
        if (imageObj.selected) {
            this.drawSelectionBorder(ctx, imageObj);
        }
    }

    /**
     * 绘制选中边框和控制点
     */
    drawSelectionBorder(ctx, imageObj) {
        // 选中时始终显示控制点，确保旋转按钮可见
        const showControls = true;
        
        ctx.save();
        
        // 移动到图像中心
        const centerX = imageObj.x + imageObj.width / 2;
        const centerY = imageObj.y + imageObj.height / 2;
        ctx.translate(centerX, centerY);
        
        // 应用旋转（与图像相同的旋转）
        if (imageObj.rotation !== 0) {
            ctx.rotate((imageObj.rotation * Math.PI) / 180);
        }
        
        // 应用翻转（与图像相同的翻转）
        let scaleX = 1;
        let scaleY = 1;
        if (imageObj.flipHorizontal) scaleX = -1;
        if (imageObj.flipVertical) scaleY = -1;
        ctx.scale(scaleX, scaleY);
        
        // 绘制边框（相对于图像中心）
        ctx.strokeStyle = '#007ACC';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-imageObj.width / 2, -imageObj.height / 2, imageObj.width, imageObj.height);
        
        // 始终显示控制点，确保旋转按钮可见
        if (showControls) {
            const handleSize = 8;
            const rotateDistance = 25;
            
            // 图像边界（相对于中心）
            const left = -imageObj.width / 2;
            const right = imageObj.width / 2;
            const top = -imageObj.height / 2;
            const bottom = imageObj.height / 2;
            
            // 缩放控制点（只显示四个角）
            const resizeHandles = [
                { x: left, y: top },           // 左上
                { x: right, y: top },          // 右上
                { x: left, y: bottom },        // 左下
                { x: right, y: bottom }        // 右下
            ];
            
            // 绘制缩放控制点
            ctx.fillStyle = '#007ACC';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            
            resizeHandles.forEach(handle => {
                ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
                ctx.strokeRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
            });
            
            // 旋转控制点（在角落外侧）
            const rotateHandles = [
                { x: left - rotateDistance, y: top - rotateDistance },
                { x: right + rotateDistance, y: top - rotateDistance },
                { x: left - rotateDistance, y: bottom + rotateDistance },
                { x: right + rotateDistance, y: bottom + rotateDistance }
            ];
            
            // 绘制旋转控制点（圆形，更明显）
            ctx.fillStyle = '#FF6B35';
            ctx.strokeStyle = '#FFFFFF';
            
            rotateHandles.forEach(handle => {
                ctx.beginPath();
                ctx.arc(handle.x, handle.y, handleSize/2 + 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                
                // 添加旋转图标
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('↻', handle.x, handle.y + 4);
            });
        }
        
        ctx.restore();
    }

    /**
     * 获取包含图像的画布数据
     */
    getCanvasWithImages() {
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasManager.canvas.width;
        tempCanvas.height = this.canvasManager.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 绘制原始画布内容
        tempCtx.drawImage(this.canvasManager.canvas, 0, 0);
        
        // 绘制所有图像
        this.images.forEach(imageObj => {
            this.drawImage(tempCtx, imageObj);
        });
        
        return tempCanvas;
    }

    /**
     * 清除所有图像
     */
    clearAllImages() {
        this.images = [];
        this.selectedImage = null;
        
        // 隐藏预览和控制面板
        const previewContainer = document.getElementById('imagePreview');
        const controlsContainer = document.getElementById('imageControls');
        if (previewContainer) previewContainer.style.display = 'none';
        if (controlsContainer) controlsContainer.style.display = 'none';
        
        this.canvasManager.redraw();
    }

    /**
     * 获取图像数据用于保存
     */
    getImageData() {
        return this.images.map(img => ({
            fileName: img.fileName,
            x: img.x,
            y: img.y,
            width: img.width,
            height: img.height,
            originalWidth: img.originalWidth,
            originalHeight: img.originalHeight,
            scale: img.scale,
            rotation: img.rotation,
            opacity: img.opacity,
            flipHorizontal: img.flipHorizontal,
            flipVertical: img.flipVertical,
            imageSrc: img.image.src
        }));
    }

    /**
     * 从数据恢复图像
     */
    loadImageData(imageData) {
        this.clearAllImages();
        
        imageData.forEach(data => {
            const img = new Image();
            img.onload = () => {
                const imageObj = {
                    id: Date.now() + Math.random(),
                    image: img,
                    fileName: data.fileName,
                    x: data.x,
                    y: data.y,
                    width: data.width,
                    height: data.height,
                    originalWidth: data.originalWidth,
                    originalHeight: data.originalHeight,
                    scale: data.scale,
                    rotation: data.rotation,
                    opacity: data.opacity,
                    flipHorizontal: data.flipHorizontal,
                    flipVertical: data.flipVertical,
                    selected: false
                };
                
                this.images.push(imageObj);
                this.canvasManager.redraw();
            };
            img.src = data.imageSrc;
        });
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageTool;
}