// 音频生成器 - 使用Web Audio API生成斗牛音效
class AudioGenerator {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.oscillators = [];
        this.gainNodes = [];
        this.intervalId = null;
    }

    // 初始化音频上下文
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return true;
        } catch (error) {
            console.log('Web Audio API 不支持:', error);
            return false;
        }
    }

    // 生成斗牛风格的音效
    generateBullfightMusic() {
        if (!this.audioContext) {
            if (!this.init()) return;
        }

        // 恢复音频上下文（如果被暂停）
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isPlaying = true;
        this.playBullfightSequence();
    }

    // 播放斗牛音乐序列
    playBullfightSequence() {
        const sequences = [
            { freq: 220, duration: 0.5 }, // A3
            { freq: 246.94, duration: 0.5 }, // B3
            { freq: 277.18, duration: 0.5 }, // C#4
            { freq: 293.66, duration: 0.5 }, // D4
            { freq: 329.63, duration: 0.5 }, // E4
            { freq: 369.99, duration: 0.5 }, // F#4
            { freq: 415.30, duration: 0.5 }, // G#4
            { freq: 440, duration: 1.0 }     // A4
        ];

        let currentIndex = 0;
        
        const playNext = () => {
            if (!this.isPlaying) return;
            
            if (currentIndex >= sequences.length) {
                currentIndex = 0; // 循环播放
            }
            
            const note = sequences[currentIndex];
            this.playNote(note.freq, note.duration);
            currentIndex++;
            
            this.intervalId = setTimeout(playNext, note.duration * 1000);
        };
        
        playNext();
    }

    // 播放单个音符
    playNote(frequency, duration) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // 设置波形类型（三角波更接近传统乐器声音）
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // 设置音量包络
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        // 连接音频节点
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 播放音符
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        // 清理
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
    }

    // 停止播放
    stop() {
        this.isPlaying = false;
        
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
        
        // 停止所有振荡器
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // 忽略已经停止的振荡器错误
            }
        });
        
        this.oscillators = [];
        this.gainNodes = [];
    }

    // 检查是否正在播放
    getIsPlaying() {
        return this.isPlaying;
    }
}

// 导出音频生成器
window.AudioGenerator = AudioGenerator;