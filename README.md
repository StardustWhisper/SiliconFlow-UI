# SiliconFlow AI 助手
![alt text](screenshots/screenshot.png)
一个基于 SiliconFlow API 的多功能 AI 助手，支持 AI 对话、文生图、图生图和语音转文本等功能。

## 功能特点

### 1. AI 对话
- 支持多种大语言模型选择（包括免费和高级模型）
- Markdown 格式渲染和语法高亮
- 支持复制对话内容（纯文本和 Markdown 格式）
- 对话历史记录管理
- 实时流式响应
- 平滑滚动和进度指示

### 2. 文生图
- 支持多种 AI 模型选择（FLUX、SD等）
- 丰富的参数调整：
  - 引导比例（1-20）
  - 推理步数（1-50）
  - 自定义分辨率（64-2048）
  - 随机种子生成
- 支持正向和负向提示词
- 生成进度动画显示
- 一键下载生成的图片

### 3. 图生图
- 支持拖拽上传图片
- 实时图片预览
- 可调节参数：
  - 变化强度（0.1-1.0）
  - 引导比例
  - 推理步数
  - 图像尺寸
  - 随机种子
- 支持正向和负向提示词
- 一键下载生成的图片

### 4. 语音转文本
- 支持多种音频格式
- 拖拽上传音频文件
- 音频预览播放
- 一键复制转换结果
- 支持多语言识别


## 部署说明

### 1. 本地开发部署

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 生产环境运行
npm run start
```

### 2. Vercel 部署

1. Fork 本项目到你的 GitHub 账户

2. 在 Vercel 中导入项目：
   - 登录 [Vercel](https://vercel.com)
   - 点击 "New Project"
   - 选择你 fork 的仓库
   - 点击 "Import"

3. 配置项目：
   - Framework Preset: 选择 "Other"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. 环境变量设置（可选）：
   ```
   NODE_ENV=production
   PORT=8080
   ALLOWED_ORIGINS=your-domain.com
   ```

5. 点击 "Deploy" 开始部署

### 3. Docker 部署

1. 使用预构建镜像：
```bash
# 拉取镜像
docker pull your-registry/siliconflow-ui:latest

# 运行容器
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e ALLOWED_ORIGINS=your-domain.com \
  your-registry/siliconflow-ui:latest
```

2. 本地构建部署：
```bash
# 构建镜像
docker build -t siliconflow-ui:latest .

# 运行容器
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  siliconflow-ui:latest
```

3. Docker Compose 部署：

创建 `docker-compose.yml`:
```yaml
version: '3.8'
services:
  siliconflow-ui:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - ALLOWED_ORIGINS=your-domain.com
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```


## 环境要求

- Node.js >= 18.0.0
- NPM >= 8.0.0
- 现代浏览器支持
- 支持 WebSocket（用于流式响应）

## 使用指南

### 1. API Key 设置
- 访问设置页面配置 API Key
- 按照指引在 SiliconFlow 平台申请
- 所有功能共用同一个 API Key

### 2. 功能使用
- 对话：选择合适的模型开始对话
- 文生图：调整参数生成图片
- 图生图：上传参考图片创作
- 语音转文本：上传音频文件转换

### 3. 历史记录
- 查看历史对话
- 继续历史会话
- 删除单条记录
- 清空所有记录

## 更新日志

### v1.3.0
- 统一的 API Key 管理
- 改进的对话历史功能
- 优化的用户界面
- 新增进度指示器
- 改进的错误处理

## 许可证

MIT License