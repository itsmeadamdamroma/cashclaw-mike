FROM node:22-alpine

WORKDIR /app/backend

COPY . /app

RUN npm install --prefix /app/backend
RUN npm run build --prefix /app/backend

EXPOSE 3001

ENTRYPOINT ["node", "/app/backend/dist/index.js"]
