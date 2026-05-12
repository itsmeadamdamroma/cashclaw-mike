FROM node:22-alpine

WORKDIR /app

COPY . .

RUN cd backend && npm install
RUN cd backend && npm run build

EXPOSE 3001

WORKDIR /app/backend
CMD ["npm", "start"]
