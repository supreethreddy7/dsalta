FROM node:20-bookworm-slim


RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/server.js"]
