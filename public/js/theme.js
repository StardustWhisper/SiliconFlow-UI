function initializeTheme() {
    // 设置背景
    const backgroundImage = localStorage.getItem('backgroundImage');
    if (backgroundImage) {
        document.documentElement.style.setProperty('--background-image', `url(${backgroundImage})`);
        document.body.style.backgroundImage = `url(${backgroundImage})`;
        // 分析背景图片颜色并应用
        analyzeAndApplyColors(backgroundImage);
    } else {
        document.documentElement.style.setProperty('--background-image', 'none');
        document.body.style.backgroundImage = 'none';
        // 恢复默认颜色
        resetColors();
    }

    // 初始化主题切换
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.checked = savedTheme === 'dark';

        themeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }
}

// 分析图片颜色并应用到页面元素
async function analyzeAndApplyColors(imageData) {
    try {
        const colors = await getImageColors(imageData);
        if (colors.length > 0) {
            // 应用主色调
            const mainColor = colors[0];
            const { r, g, b } = parseRGB(mainColor);
            
            // 计算颜色亮度
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const isDark = brightness < 128;

            // 设置文本颜色
            document.documentElement.style.setProperty(
                '--text-primary',
                isDark ? '#ffffff' : '#000000'
            );
            document.documentElement.style.setProperty(
                '--text-secondary',
                isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
            );

            // 设置主题色
            document.documentElement.style.setProperty('--primary-color', mainColor);
            document.documentElement.style.setProperty(
                '--secondary-color',
                adjustColor(mainColor, isDark ? 20 : -20)
            );

            // 设置背景色
            const bgColor = `rgba(${r},${g},${b},0.1)`;
            document.documentElement.style.setProperty('--bg-primary', bgColor);
            document.documentElement.style.setProperty(
                '--bg-secondary',
                `rgba(${r},${g},${b},0.2)`
            );

            // 设置卡片背景
            document.documentElement.style.setProperty(
                '--card-bg',
                `rgba(${r},${g},${b},0.85)`
            );

            // 设置边框颜色
            document.documentElement.style.setProperty(
                '--border-color',
                isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            );

            // 设置阴影颜色
            document.documentElement.style.setProperty(
                '--shadow-color',
                isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'
            );
        }
    } catch (error) {
        console.error('Error analyzing colors:', error);
        resetColors();
    }
}

// 获取图片主要颜色
async function getImageColors(imageData) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const size = 100;
            canvas.width = size;
            canvas.height = size;
            
            ctx.drawImage(img, 0, 0, size, size);
            const imageData = ctx.getImageData(0, 0, size, size);
            const colors = extractMainColors(imageData.data);
            resolve(colors);
        };
        img.onerror = reject;
        img.src = imageData;
    });
}

// 提取主要颜色
function extractMainColors(data) {
    const colorMap = new Map();
    const step = 4;

    for (let i = 0; i < data.length; i += 4 * step) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const a = data[i + 3];

        if (a < 128) continue;

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 30 || brightness > 225) continue;

        const color = `rgb(${r},${g},${b})`;
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }

    return Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color]) => color);
}

// 解析 RGB 颜色
function parseRGB(color) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
    };
}

// 调整颜色亮度
function adjustColor(color, amount) {
    const { r, g, b } = parseRGB(color);
    return `rgb(${
        Math.max(0, Math.min(255, r + amount))
    },${
        Math.max(0, Math.min(255, g + amount))
    },${
        Math.max(0, Math.min(255, b + amount))
    })`;
}

// 重置为默认颜色
function resetColors() {
    const isLight = document.documentElement.getAttribute('data-theme') !== 'dark';
    if (isLight) {
        document.documentElement.style.setProperty('--bg-primary', '#c8c5c5');
        document.documentElement.style.setProperty('--bg-secondary', '#dbdada');
        document.documentElement.style.setProperty('--text-primary', '#0e0e0e');
        document.documentElement.style.setProperty('--text-secondary', '#000000');
        document.documentElement.style.setProperty('--border-color', '#fffdfd');
        document.documentElement.style.setProperty('--primary-color', '#4A90E2');
        document.documentElement.style.setProperty('--secondary-color', '#357ABD');
        document.documentElement.style.setProperty('--card-bg', '#d8d7d7');
    } else {
        document.documentElement.style.setProperty('--bg-primary', '#1a1a1a');
        document.documentElement.style.setProperty('--bg-secondary', '#2d2d2d');
        document.documentElement.style.setProperty('--text-primary', '#e9ecef');
        document.documentElement.style.setProperty('--text-secondary', '#adb5bd');
        document.documentElement.style.setProperty('--border-color', '#404040');
        document.documentElement.style.setProperty('--primary-color', '#4361ee');
        document.documentElement.style.setProperty('--secondary-color', '#3f37c9');
        document.documentElement.style.setProperty('--card-bg', '#2d2d2d');
    }
}

// 在所有页面加载时调用
document.addEventListener('DOMContentLoaded', initializeTheme);

// 添加背景图片更新函数
window.updateBackgroundImage = function(imageData) {
    if (imageData) {
        document.documentElement.style.setProperty('--background-image', `url(${imageData})`);
        document.body.style.backgroundImage = `url(${imageData})`;
        localStorage.setItem('backgroundImage', imageData);
        analyzeAndApplyColors(imageData);
    } else {
        document.documentElement.style.setProperty('--background-image', 'none');
        document.body.style.backgroundImage = 'none';
        localStorage.removeItem('backgroundImage');
        resetColors();
    }
}; 