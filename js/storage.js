/**
 * 二次元画板应用 - 存储管理文件
 * 处理作品的本地保存和管理
 */

class StorageManager {
    constructor() {
        this.storageKey = 'anime_canvas_artworks';
        this.settingsKey = 'anime_canvas_settings';
        this.maxArtworks = 50; // 最大保存作品数量
        this.isSupported = this.checkStorageSupport();
        
        if (!this.isSupported) {
            console.warn('LocalStorage not supported, artworks will not be saved');
        }
    }

    /**
     * 检查浏览器是否支持localStorage
     */
    checkStorageSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 保存作品
     * @param {Object} artwork - 作品对象
     * @param {string} artwork.id - 作品ID
     * @param {string} artwork.title - 作品标题
     * @param {string} artwork.imageData - 图片数据(base64)
     * @param {string} artwork.createdAt - 创建时间
     * @param {string} artwork.thumbnail - 缩略图数据
     */
    saveArtwork(artwork) {
        if (!this.isSupported) {
            console.warn('Storage not supported');
            return false;
        }

        try {
            const artworks = this.getAllArtworks();
            
            // 检查是否已存在相同ID的作品
            const existingIndex = artworks.findIndex(item => item.id === artwork.id);
            
            if (existingIndex !== -1) {
                // 更新现有作品
                artworks[existingIndex] = {
                    ...artworks[existingIndex],
                    ...artwork,
                    updatedAt: new Date().toISOString()
                };
            } else {
                // 添加新作品
                artworks.unshift(artwork); // 添加到开头
                
                // 限制作品数量
                if (artworks.length > this.maxArtworks) {
                    artworks.splice(this.maxArtworks);
                }
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(artworks));
            return true;
        } catch (error) {
            console.error('Failed to save artwork:', error);
            return false;
        }
    }

    /**
     * 获取所有作品
     * @returns {Array} 作品数组
     */
    getAllArtworks() {
        if (!this.isSupported) {
            return [];
        }

        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load artworks:', error);
            return [];
        }
    }

    /**
     * 根据ID获取作品
     * @param {string} id - 作品ID
     * @returns {Object|null} 作品对象或null
     */
    getArtwork(id) {
        const artworks = this.getAllArtworks();
        return artworks.find(artwork => artwork.id === id) || null;
    }

    /**
     * 删除作品
     * @param {string} id - 作品ID
     * @returns {boolean} 是否删除成功
     */
    deleteArtwork(id) {
        if (!this.isSupported) {
            return false;
        }

        try {
            const artworks = this.getAllArtworks();
            const filteredArtworks = artworks.filter(artwork => artwork.id !== id);
            
            localStorage.setItem(this.storageKey, JSON.stringify(filteredArtworks));
            return true;
        } catch (error) {
            console.error('Failed to delete artwork:', error);
            return false;
        }
    }

    /**
     * 清空所有作品
     * @returns {boolean} 是否清空成功
     */
    clearAllArtworks() {
        if (!this.isSupported) {
            return false;
        }

        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear artworks:', error);
            return false;
        }
    }

    /**
     * 获取作品统计信息
     * @returns {Object} 统计信息
     */
    getArtworkStats() {
        const artworks = this.getAllArtworks();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return {
            total: artworks.length,
            today: artworks.filter(artwork => 
                new Date(artwork.createdAt) >= today
            ).length,
            thisWeek: artworks.filter(artwork => 
                new Date(artwork.createdAt) >= thisWeek
            ).length,
            thisMonth: artworks.filter(artwork => 
                new Date(artwork.createdAt) >= thisMonth
            ).length,
            storageUsed: this.getStorageUsage()
        };
    }

    /**
     * 获取存储使用情况
     * @returns {Object} 存储使用信息
     */
    getStorageUsage() {
        if (!this.isSupported) {
            return { used: 0, total: 0, percentage: 0 };
        }

        try {
            let totalSize = 0;
            let artworkSize = 0;
            
            // 计算总存储大小
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                    if (key === this.storageKey) {
                        artworkSize = localStorage[key].length;
                    }
                }
            }

            // localStorage通常限制为5-10MB
            const estimatedLimit = 5 * 1024 * 1024; // 5MB
            
            return {
                used: Utils.formatFileSize(totalSize),
                artworkSize: Utils.formatFileSize(artworkSize),
                total: Utils.formatFileSize(estimatedLimit),
                percentage: Math.round((totalSize / estimatedLimit) * 100)
            };
        } catch (error) {
            console.error('Failed to calculate storage usage:', error);
            return { used: 0, total: 0, percentage: 0 };
        }
    }

    /**
     * 保存应用设置
     * @param {Object} settings - 设置对象
     */
    saveSettings(settings) {
        if (!this.isSupported) {
            return false;
        }

        try {
            const currentSettings = this.getSettings();
            const newSettings = { ...currentSettings, ...settings };
            localStorage.setItem(this.settingsKey, JSON.stringify(newSettings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    /**
     * 获取应用设置
     * @returns {Object} 设置对象
     */
    getSettings() {
        if (!this.isSupported) {
            return this.getDefaultSettings();
        }

        try {
            const data = localStorage.getItem(this.settingsKey);
            return data ? { ...this.getDefaultSettings(), ...JSON.parse(data) } : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * 获取默认设置
     * @returns {Object} 默认设置对象
     */
    getDefaultSettings() {
        return {
            // 画布设置
            canvasWidth: 800,
            canvasHeight: 600,
            backgroundColor: '#FFFFFF',
            showGrid: false,
            gridSize: 20,
            gridColor: '#E0E0E0',
            
            // 工具设置
            defaultTool: 'brush',
            brushSize: 5,
            brushColor: '#FF69B4',
            brushOpacity: 100,
            brushHardness: 100,
            
            // 界面设置
            theme: 'pink',
            language: 'zh-CN',
            showToolTips: true,
            autoSave: true,
            autoSaveInterval: 30000, // 30秒
            
            // 导出设置
            defaultExportFormat: 'png',
            defaultExportQuality: 100,
            
            // 其他设置
            maxUndoSteps: 50,
            enableKeyboardShortcuts: true,
            showWelcomeMessage: true
        };
    }

    /**
     * 重置设置为默认值
     */
    resetSettings() {
        if (!this.isSupported) {
            return false;
        }

        try {
            localStorage.removeItem(this.settingsKey);
            return true;
        } catch (error) {
            console.error('Failed to reset settings:', error);
            return false;
        }
    }

    /**
     * 导出所有数据
     * @returns {Object} 包含所有作品和设置的对象
     */
    exportAllData() {
        return {
            artworks: this.getAllArtworks(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * 导入数据
     * @param {Object} data - 要导入的数据
     * @param {boolean} merge - 是否合并现有数据
     * @returns {boolean} 是否导入成功
     */
    importData(data, merge = false) {
        if (!this.isSupported) {
            return false;
        }

        try {
            if (data.artworks) {
                if (merge) {
                    const existingArtworks = this.getAllArtworks();
                    const mergedArtworks = [...data.artworks, ...existingArtworks]
                        .filter((artwork, index, self) => 
                            index === self.findIndex(a => a.id === artwork.id)
                        )
                        .slice(0, this.maxArtworks);
                    localStorage.setItem(this.storageKey, JSON.stringify(mergedArtworks));
                } else {
                    localStorage.setItem(this.storageKey, JSON.stringify(data.artworks));
                }
            }

            if (data.settings) {
                if (merge) {
                    const existingSettings = this.getSettings();
                    const mergedSettings = { ...existingSettings, ...data.settings };
                    localStorage.setItem(this.settingsKey, JSON.stringify(mergedSettings));
                } else {
                    localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
                }
            }

            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    /**
     * 清理过期数据
     * @param {number} daysOld - 删除多少天前的数据
     * @returns {number} 删除的作品数量
     */
    cleanupOldArtworks(daysOld = 30) {
        if (!this.isSupported) {
            return 0;
        }

        try {
            const artworks = this.getAllArtworks();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const filteredArtworks = artworks.filter(artwork => 
                new Date(artwork.createdAt) > cutoffDate
            );

            const deletedCount = artworks.length - filteredArtworks.length;
            
            if (deletedCount > 0) {
                localStorage.setItem(this.storageKey, JSON.stringify(filteredArtworks));
            }

            return deletedCount;
        } catch (error) {
            console.error('Failed to cleanup old artworks:', error);
            return 0;
        }
    }

    /**
     * 搜索作品
     * @param {string} query - 搜索关键词
     * @returns {Array} 匹配的作品数组
     */
    searchArtworks(query) {
        if (!query || query.trim() === '') {
            return this.getAllArtworks();
        }

        const artworks = this.getAllArtworks();
        const searchTerm = query.toLowerCase().trim();

        return artworks.filter(artwork => 
            artwork.title.toLowerCase().includes(searchTerm) ||
            (artwork.tags && artwork.tags.some(tag => 
                tag.toLowerCase().includes(searchTerm)
            ))
        );
    }

    /**
     * 按日期排序作品
     * @param {string} order - 排序方式 ('asc' 或 'desc')
     * @returns {Array} 排序后的作品数组
     */
    sortArtworksByDate(order = 'desc') {
        const artworks = this.getAllArtworks();
        
        return artworks.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            
            return order === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }

    /**
     * 获取存储支持状态
     * @returns {boolean} 是否支持存储
     */
    isStorageSupported() {
        return this.isSupported;
    }

    /**
     * 备份数据到文件
     */
    backupToFile() {
        const data = this.exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const filename = `anime_canvas_backup_${Utils.formatDateTime(new Date()).replace(/[:\s-]/g, '_')}.json`;
        Utils.downloadFile(blob, filename);
    }

    /**
     * 从文件恢复数据
     * @param {File} file - 备份文件
     * @param {boolean} merge - 是否合并现有数据
     * @returns {Promise<boolean>} 是否恢复成功
     */
    restoreFromFile(file, merge = false) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const success = this.importData(data, merge);
                    resolve(success);
                } catch (error) {
                    console.error('Failed to restore from file:', error);
                    resolve(false);
                }
            };
            
            reader.onerror = () => {
                console.error('Failed to read backup file');
                resolve(false);
            };
            
            reader.readAsText(file);
        });
    }
}

// 导出存储管理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} else {
    window.StorageManager = StorageManager;
}