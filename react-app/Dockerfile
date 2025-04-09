FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=3028
ENV REACT_APP_API_URL=http://localhost:8038/api
EXPOSE 3028

CMD ["npm", "start"] 