const axios = require('axios');
const { PNG } = require('png-metadata');

module.exports = async (req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    try {
        const imageUrl = req.query.url;
        const fileName = req.query.fileName || 'image.png';
        const prompt = req.query.prompt || 'No prompt provided';

        if (!imageUrl) {
            return res.status(400).json({ error: '缺少图片URL参数' });
        }

        // 获取图片
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer'  // 改为 arraybuffer 以确保完整接收数据
        });

        // 创建 PNG 图像对象
        const png = new PNG(response.data);

        // 添加提示词到 PNG 图像的注释
        png.text = {
            'Description': prompt
        };

        // 编码 PNG 图像
        const encodedPng = png.encode();

        // 设置响应头，确保文件名编码正确
        const encodedFilename = encodeURIComponent(fileName).replace(/['()]/g, escape);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', encodedPng.length);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);

        // 直接发送二进制数据
        res.send(encodedPng);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            error: '下载图片失败',
            details: error.message
        });
    }
};
