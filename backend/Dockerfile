FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY src ./src
COPY seed.js ./seed.js
COPY sample.json ./sample.json
RUN npx prisma generate

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
