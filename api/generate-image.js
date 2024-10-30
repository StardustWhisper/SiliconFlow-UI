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
            return res.status(400).json({ error: '缺少必要参数' });
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

        const response = await axios.post(
            'https://api.siliconflow.cn/v1/image/generations',
            requestBody,
            config
        );

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: '生成图片失败',
            details: error.response?.data || error.message
        });
    }
}; 