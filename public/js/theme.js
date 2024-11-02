function initializeTheme() {
    // 设置背景
    const backgroundImage = localStorage.getItem('backgroundImage');
    if (backgroundImage) {
        document.documentElement.style.setProperty('--background-image', `url(${backgroundImage})`);
        document.body.style.backgroundImage = `url(${backgroundImage})`;
    } else {
        document.documentElement.style.setProperty('--background-image', 'none');
        document.body.style.backgroundImage = 'none';
    }

    // 设置主题色
    const primaryColor = localStorage.getItem('primaryColor');
    if (primaryColor) {
        document.documentElement.style.setProperty('--primary-color', primaryColor);
    }

    // 初始化主题切换
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.checked = savedTheme === 'dark';

        // 添加主题切换事件监听
        themeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }

    // 计算 RGB 值用于透明度
    function hexToRgb(hex) {
        // 移除 # 号
        hex = hex.replace('#', '');
        
        // 处理缩写形式
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
    }

    // 更新 RGB 变量
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-primary').trim();
    const cardBgColor = computedStyle.getPropertyValue('--card-bg').trim();
    
    try {
        const bgRgb = hexToRgb(bgColor);
        if (bgRgb) {
            document.documentElement.style.setProperty(
                '--bg-primary-rgb',
                `${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}`
            );
        }

        const cardRgb = hexToRgb(cardBgColor);
        if (cardRgb) {
            document.documentElement.style.setProperty(
                '--card-bg-rgb',
                `${cardRgb.r}, ${cardRgb.g}, ${cardRgb.b}`
            );
        }
    } catch (error) {
        console.warn('Error parsing colors:', error);
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
    } else {
        document.documentElement.style.setProperty('--background-image', 'none');
        document.body.style.backgroundImage = 'none';
        localStorage.removeItem('backgroundImage');
    }
}; 