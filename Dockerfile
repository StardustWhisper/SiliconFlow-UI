# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .
COPY .env .

# 构建应用
RUN npm run build

# 运行阶段
FROM node:18-alpine

# 安装 tini
RUN apk add --no-cache tini

WORKDIR /app

# 从构建阶段复制必要的文件
COPY --from=builder /app/dist ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/server.prod.js .
COPY --from=builder /app/.env .

# 设置环境变量
ENV NODE_ENV=production

# 使用 tini 作为入口点
ENTRYPOINT ["/sbin/tini", "--"]

# 启动命令
CMD ["node", "server.prod.js"]

# 暴露端口
EXPOSE 8080
