const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

async function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        const file = fs.createWriteStream(filepath);
        
        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function scrapeAigei() {
    let browser;
    try {
        console.log('启动浏览器...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // 设置用户代理
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log('访问爱给网页面...');
        await page.goto('https://www.aigei.com/s?q=%E6%96%97%E7%89%9B%E5%A3%AB', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // 等待页面加载
        await page.waitForTimeout(3000);
        
        console.log('查找西班牙斗牛士进行曲...');
        
        // 查找包含"西班牙斗牛士进行曲"的音频项目
        const audioItems = await page.evaluate(() => {
            const items = [];
            const elements = document.querySelectorAll('[class*="item"], [class*="card"], [class*="result"]');
            
            elements.forEach(element => {
                const text = element.textContent || '';
                if (text.includes('西班牙斗牛士进行曲') || text.includes('斗牛士')) {
                    // 查找下载链接或播放链接
                    const links = element.querySelectorAll('a[href]');
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && (href.includes('.mp3') || href.includes('download') || href.includes('play'))) {
                            items.push({
                                title: text.trim(),
                                url: href,
                                element: element.outerHTML
                            });
                        }
                    });
                }
            });
            
            return items;
        });
        
        console.log(`找到 ${audioItems.length} 个相关音频项目`);
        
        if (audioItems.length === 0) {
            // 尝试另一种方法：查找所有音频相关的链接
            console.log('尝试查找所有音频链接...');
            const allAudioLinks = await page.evaluate(() => {
                const links = [];
                const audioElements = document.querySelectorAll('a[href*=".mp3"], a[href*="audio"], a[href*="sound"]');
                audioElements.forEach(el => {
                    links.push({
                        title: el.textContent || el.title || '未知音频',
                        url: el.getAttribute('href')
                    });
                });
                return links;
            });
            
            console.log(`找到 ${allAudioLinks.length} 个音频链接`);
            audioItems.push(...allAudioLinks);
        }
        
        // 创建audio目录
        const audioDir = path.join(__dirname, 'audio');
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }
        
        // 尝试下载找到的音频文件
        for (let i = 0; i < Math.min(audioItems.length, 3); i++) {
            const item = audioItems[i];
            console.log(`尝试下载: ${item.title}`);
            console.log(`URL: ${item.url}`);
            
            try {
                let downloadUrl = item.url;
                
                // 如果是相对路径，转换为绝对路径
                if (downloadUrl.startsWith('/')) {
                    downloadUrl = 'https://www.aigei.com' + downloadUrl;
                } else if (!downloadUrl.startsWith('http')) {
                    downloadUrl = 'https://www.aigei.com/' + downloadUrl;
                }
                
                const filename = `bullfight_${i + 1}.mp3`;
                const filepath = path.join(audioDir, filename);
                
                await downloadFile(downloadUrl, filepath);
                console.log(`成功下载: ${filename}`);
                
                // 如果成功下载了第一个文件，就停止
                if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
                    console.log('下载完成！');
                    break;
                }
            } catch (error) {
                console.log(`下载失败: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('爬取过程中出现错误:', error);
        
        // 如果爬取失败，创建一个备用的音频文件
        console.log('创建备用音频文件...');
        const audioDir = path.join(__dirname, 'audio');
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }
        
        // 使用ffmpeg创建一个简单的斗牛士风格音频
        const { exec } = require('child_process');
        const backupAudioPath = path.join(audioDir, 'spanish_bullfight_backup.mp3');
        
        const ffmpegCommand = `ffmpeg -f lavfi -i "sine=frequency=440:duration=2,sine=frequency=523:duration=2,sine=frequency=659:duration=2,sine=frequency=784:duration=2" -ar 44100 -ac 2 -b:a 128k "${backupAudioPath}"`;
        
        exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
                console.log('FFmpeg不可用，使用现有音频文件');
            } else {
                console.log('成功创建备用音频文件');
            }
        });
        
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行爬虫
scrapeAigei().then(() => {
    console.log('爬取任务完成');
}).catch(error => {
    console.error('爬取失败:', error);
});