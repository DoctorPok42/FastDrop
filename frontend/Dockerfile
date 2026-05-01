FROM node:25.8.1-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build --legacy-peer-deps

CMD ["npm", "run", "start"]
