# SiliconFlow 图片生成器

一个基于 SiliconFlow API 的图片生成 Web 应用，支持多种模型和参数调整，提供直观的用户界面。

## 功能特点

- 支持多种 AI 模型选择
- 自定义图片生成参数
  - 分辨率调整
  - 引导比例（Guidance Scale）
  - 推理步数（Inference Steps）
  - Seed 值控制
- 正面/负面提示词输入
- 暗色/亮色主题切换
- 图片一键下载
- API Key 本地保存

## 快速开始

### 使用 Docker（推荐）

1. 构建镜像：
```bash
docker build -t siliconflow-ui:latest .
```

2. 运行容器：
```bash
docker run -d -p 8080:8080 --name siliconflow-ui siliconflow-ui:latest
```

### 手动部署

1. 安装依赖：
```bash
npm install
```

2. 构建项目：
```bash
npm run build
```

3. 启动服务：
```bash
npm run serve
```

## 环境要求

- Node.js 18.x 或更高版本
- npm 8.x 或更高版本

## 配置说明

### 环境变量

创建 `.env` 文件并配置以下参数：

```env
PORT=8080                    # 服务器端口
HOST=0.0.0.0                # 服务器主机
NODE_ENV=production         # 运行环境
ALLOWED_ORIGINS=*          # 允许的跨域来源
```

## 使用指南

1. **API Key 设置**
   - 在设置区域输入您的 SiliconFlow API Key
   - 点击保存按钮将 API Key 保存到本地

2. **模型选择**
   - FLUX.1-schnell（默认，推荐）
   - Pro-FLUX.1-schnell（专业版）
   - stable-diffusion-3-5-large 
   - FLUX.1-dev
   - stable-diffusion-3-medium
   - stable-diffusion-xl-base-1.0
   - stable-diffusion-2-1

3. **参数调整**
   - 分辨率：支持多种标准尺寸
     - 1440x900
     - 1024x1024
     - 512x512
     - 768x1024
     - 1024x768
     - 768x1024
   - 引导比例：控制生成图片与提示词的匹配程度（默认 7.5）
   - 推理步数：影响生成质量和速度（默认 10）
   - Seed：控制生成结果的随机性，支持手动输入或随机生成

4. **图片生成**
   - 输入详细的图片描述
   - 可选添加负面提示词
   - 点击生成按钮开始创建图片

5. **图片下载**
   - 点击生成的图片即可下载
   - 文件名包含生成参数信息

## 开发说明

### 项目结构
```
project/
├── public/               # 静态资源
│   ├── index.html       # 主页面
│   ├── styles.css       # 样式文件
│   └── script.js        # 前端脚本
├── server.prod.js       # 生产环境服务器
├── package.json         # 项目配置
├── Dockerfile           # Docker 配置
└── .env                 # 环境变量
```

### 构建和部署

1. 开发环境：
```bash
npm start
```

2. 生产环境：
```bash
npm run build
npm run serve
```

3. Docker 部署：
```bash
docker build -t siliconflow-ui:latest .
docker run -d -p 8080:8080 siliconflow-ui:latest
```

## 安全说明

- API Key 仅保存在用户本地
- 支持 HTTPS
- 启用了必要的安全头部
- 使用 helmet 增强安全性

## 故障排除

1. **图片生成失败**
   - 检查 API Key 是否有效
   - 确认网络连接正常
   - 查看浏览器控制台错误信息

2. **下载问题**
   - 确保有足够的存储空间
   - 检查浏览器下载权限

3. **服务器问题**
   - 检查端口是否被占用
   - 确认环境变量配置正确

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 基本图片生成功能
- 暗色主题支持
- Docker 支持