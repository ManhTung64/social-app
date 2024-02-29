FROM node:18.15

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
