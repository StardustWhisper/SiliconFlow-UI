const axios = require('axios');

module.exports = async (req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

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
            return res.status(400).json({ 
                error: '缺少必要参数',
                details: !prompt ? '缺少提示词' : '缺少 API Key'
            });
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };

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
            ...requestBody,
            apiKey: '***' // 隐藏 API Key
        });

        const response = await axios.post(
            'https://api.siliconflow.cn/v1/image/generations',
            requestBody,
            config
        );

        console.log('Response from SiliconFlow:', response.data);

        // 检查响应数据的结构
        if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
            throw new Error('API 返回的数据格式不正确');
        }

        if (response.data.data.length === 0) {
            throw new Error('API 未返回任何图片数据');
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // 构建详细的错误信息
        const errorMessage = error.response?.data?.error || error.message;
        const statusCode = error.response?.status || 500;
        const errorDetails = error.response?.data?.details || '请检查 API Key 是否正确，以及其他参数是否有效';

        res.status(statusCode).json({
            error: '生成图片失败',
            message: errorMessage,
            details: errorDetails,
            status: statusCode
        });
    }
}; 