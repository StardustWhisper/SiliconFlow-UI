const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// CORS 配置选项
const corsOptions = {
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

app.options('*', cors(corsOptions));

// 代理请求到 SiliconFlow API
app.post('/api/generate-image', async (req, res) => {
    try {
        const { 
            prompt, 
            negative_prompt = "",
            apiKey, 
            model = "stabilityai/stable-diffusion-3-5-large", 
            imageSize = "1024x1024",
            guidanceScale = 7.5,
            inferenceSteps = 50,
            seed = 0
        } = req.body;
        
        if (!prompt || !apiKey) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };

        // 构建请求体
        const requestBody = {
            model: model,
            prompt: prompt,
            negative_prompt: negative_prompt,
            image_size: imageSize,
            guidance_scale: guidanceScale,
            num_inference_steps: inferenceSteps,
            seed: seed
        };

        console.log('Sending request to SiliconFlow API:', {
            url: 'https://api.siliconflow.cn/v1/image/generations',
            ...requestBody
        });

        const response = await axios.post(
            'https://api.siliconflow.cn/v1/image/generations',
            requestBody,
            config
        );

        console.log('Response from SiliconFlow:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        res.status(error.response?.status || 500).json({
            error: '生成图片失败',
            details: error.response?.data || error.message
        });
    }
});

// 添加一个测试端点
app.get('/api/test', (req, res) => {
    res.json({ message: 'API服务器正常运行' });
});

// 修改下载图片的路由处理
app.get('/api/download-image', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        const fileName = req.query.fileName || 'image.png'; // 添加文件名参数

        if (!imageUrl) {
            return res.status(400).json({ error: '缺少图片URL参数' });
        }

        // 获取图片
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream'
        });

        // 设置响应头
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // 将图片流传输到客户端
        response.data.pipe(res);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            error: '下载图片失败',
            details: error.message
        });
    }
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: '服务器错误',
        message: err.message
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
}); 