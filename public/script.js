// 保存 API Key 到本地存储
function saveApiKey() {
    const apiKey = document.getElementById('apiKey').value;
    if (apiKey) {
        localStorage.setItem('siliconflow_api_key', apiKey);
        showStatus('API Key 已保存！');
        setTimeout(() => hideStatus(), 2000);
    } else {
        showStatus('请输入有效的 API Key', true);
    }
}

// 从本地存储加载 API Key
function loadApiKey() {
    const apiKey = localStorage.getItem('siliconflow_api_key');
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
    }
}

// 显示状态消息
function showStatus(message, isError = false) {
    const loading = document.getElementById('loading');
    loading.textContent = message;
    loading.style.color = isError ? 'red' : 'var(--text-primary)';
    loading.classList.add('show');
}

// 隐藏状态消息
function hideStatus() {
    const loading = document.getElementById('loading');
    loading.classList.remove('show');
}

// 生成随机种子
function generateRandomSeed() {
    const min = 0;
    const max = 9999999999; // 10位数的最大值
    const randomSeed = Math.floor(Math.random() * (max - min + 1)) + min;
    document.getElementById('seed').value = randomSeed;
}

// 生成图片
async function generateImage() {
    const apiKey = document.getElementById('apiKey').value;
    const prompt = document.getElementById('prompt').value;
    const negativePrompt = document.getElementById('negativePrompt').value;
    const imageSize = document.getElementById('imageSize').value;
    const model = document.getElementById('model').value;
    const guidanceScale = parseFloat(document.getElementById('guidanceScale').value);
    const inferenceSteps = parseInt(document.getElementById('inferenceSteps').value);
    const seed = parseInt(document.getElementById('seed').value) || 0;
    const imageContainer = document.getElementById('imageContainer');

    if (!apiKey || !prompt) {
        showStatus('请确保已输入 API Key 和图片描述', true);
        return;
    }

    showStatus('正在生成图片，请稍候...');
    imageContainer.innerHTML = '';

    try {
        console.log('Sending request to server...');
        const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                negative_prompt: negativePrompt,
                model: model,
                image_size: imageSize,
                guidance_scale: guidanceScale,
                num_inference_steps: inferenceSteps,
                seed: seed
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
        }

        console.log('Response from server:', data);
        
        if (data.error) {
            throw new Error(data.message || data.error);
        }

        if (data.images && data.images.length > 0) {
            const imageData = data.images[0];
            const img = document.createElement('img');
            img.src = imageData.url;
            img.style.cursor = 'pointer';
            img.title = '点击下载图片';
            img.onclick = () => downloadImage(img.src);
            imageContainer.appendChild(img);
            showStatus('图片生成完成！');
            setTimeout(() => hideStatus(), 2000);
        } else {
            showStatus('生成图片失败，未返回图片数据', true);
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('生成图片时发生错误: ' + (error.message || '未知错误'), true);
    }
}

// 下载图片
async function downloadImage(imageUrl) {
    try {
        showStatus('正在下载图片...');
        
        // 获取当前参数
        const model = document.getElementById('model').value.split('/').pop(); // 只取模型名称的最后部分
        const guidanceScale = document.getElementById('guidanceScale').value;
        const inferenceSteps = document.getElementById('inferenceSteps').value;
        const seed = document.getElementById('seed').value;
        
        // 生成日期时间字符串
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        
        // 构建文件名
        const fileName = `${model}_GS${guidanceScale}_Steps${inferenceSteps}_Seed${seed}_${dateStr}_${timeStr}.png`;
        
        // 创建一个临时的 a 标签用于下载
        const link = document.createElement('a');
        link.href = `/api/download-image?url=${encodeURIComponent(imageUrl)}&fileName=${encodeURIComponent(fileName)}`;
        link.download = fileName; // 设置下载文件名
        link.target = '_blank'; // 在新标签页中打开
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showStatus('下载完成！');
        setTimeout(() => hideStatus(), 2000);
    } catch (error) {
        console.error('下载失败:', error);
        showStatus('下载图片时发生错误: ' + error.message, true);
    }
}

// 页面加载时的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载主题设置
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';

    // 主题切换事件
    themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    // 加载 API Key
    loadApiKey();
    
    // 生成随机的初始 seed
    generateRandomSeed();
});