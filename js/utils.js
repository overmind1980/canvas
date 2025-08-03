/**
 * 二次元画板应用 - 工具类文件
 * 提供通用的辅助函数和工具方法
 */

// 工具类对象
const Utils = {
    /**
     * 获取元素相对于画布的坐标
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {MouseEvent|TouchEvent} event - 事件对象
     * @returns {Object} 包含x和y坐标的对象
     */
    getCanvasCoordinates(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (event.touches && event.touches.length > 0) {
            // 触摸事件
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            // 鼠标事件
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    },

    /**
     * 颜色格式转换
     * @param {string} color - 颜色值
     * @returns {Object} RGB颜色对象
     */
    hexToRgb(color) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * RGB转十六进制
     * @param {number} r - 红色值
     * @param {number} g - 绿色值
     * @param {number} b - 蓝色值
     * @returns {string} 十六进制颜色值
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    /**
     * 计算两点之间的距离
     * @param {Object} point1 - 第一个点 {x, y}
     * @param {Object} point2 - 第二个点 {x, y}
     * @returns {number} 距离值
     */
    getDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * 限制数值在指定范围内
     * @param {number} value - 要限制的值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的值
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * 生成唯一ID
     * @returns {string} 唯一标识符
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 时间限制（毫秒）
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 深拷贝对象
     * @param {Object} obj - 要拷贝的对象
     * @returns {Object} 拷贝后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        if (typeof obj === "object") {
            const clonedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 格式化日期时间
     * @param {Date} date - 日期对象
     * @returns {string} 格式化后的日期时间字符串
     */
    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    /**
     * 检查是否为移动设备
     * @returns {boolean} 是否为移动设备
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * 检查浏览器是否支持某个功能
     * @param {string} feature - 功能名称
     * @returns {boolean} 是否支持
     */
    isSupported(feature) {
        switch (feature) {
            case 'canvas':
                return !!document.createElement('canvas').getContext;
            case 'localStorage':
                try {
                    return 'localStorage' in window && window['localStorage'] !== null;
                } catch (e) {
                    return false;
                }
            case 'touch':
                return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            default:
                return false;
        }
    },

    /**
     * 显示通知消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success, error, warning, info)
     * @param {number} duration - 显示时长（毫秒）
     */
    showNotification(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => notification.classList.add('show'), 100);

        // 关闭按钮事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        return notification;
    },

    /**
     * 隐藏通知
     * @param {HTMLElement} notification - 通知元素
     */
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    /**
     * 获取通知图标
     * @param {string} type - 通知类型
     * @returns {string} 图标字符
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    },

    /**
     * 创建模态框
     * @param {string} title - 标题
     * @param {string} content - 内容
     * @param {Array} buttons - 按钮配置数组
     * @returns {HTMLElement} 模态框元素
     */
    createModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const buttonsHtml = buttons.map(btn => 
            `<button class="modal-btn ${btn.class || ''}" data-action="${btn.action}">${btn.text}</button>`
        ).join('');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${buttonsHtml}
                </div>
            </div>
        `;

        // 添加事件监听
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(modal);
            }
        });

        // 按钮事件
        modal.querySelectorAll('.modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'close') {
                    this.hideModal(modal);
                }
                // 触发自定义事件
                modal.dispatchEvent(new CustomEvent('modalAction', {
                    detail: { action, button: e.target }
                }));
            });
        });

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);

        return modal;
    },

    /**
     * 隐藏模态框
     * @param {HTMLElement} modal - 模态框元素
     */
    hideModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    },

    /**
     * 下载文件
     * @param {string} data - 文件数据
     * @param {string} filename - 文件名
     * @param {string} type - MIME类型
     */
    downloadFile(data, filename, type = 'application/octet-stream') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * 下载Canvas为图片
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {string} filename - 文件名
     * @param {string} format - 图片格式 (png, jpeg, webp)
     * @param {number} quality - 图片质量 (0-1)
     */
    downloadCanvasAsImage(canvas, filename, format = 'png', quality = 1.0) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL(`image/${format}`, quality);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
}