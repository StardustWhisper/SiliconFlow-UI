const axios = require('axios');

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

        if (!imageUrl) {
            return res.status(400).json({ error: '缺少图片URL参数' });
        }

        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream'
        });

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        response.data.pipe(res);
    } catch (error) {
        res.status(500).json({
            error: '下载图片失败',
            details: error.message
        });
    }
}; 