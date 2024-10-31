# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段
FROM node:18-alpine

# 安装 tini 和生产环境必需的包
RUN apk add --no-cache tini curl

WORKDIR /app

# 从构建阶段复制必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/server.prod.js .

# 设置环境变量
ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# 使用 tini 作为入口点
ENTRYPOINT ["/sbin/tini", "--"]

# 启动命令
CMD ["node", "server.prod.js"]

# 暴露端口
EXPOSE 8080
