FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=3028
EXPOSE 3028

CMD ["npm", "start"] 