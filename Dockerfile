FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY . .
RUN cd backend && npm run build

EXPOSE 3001

WORKDIR /app/backend
CMD ["npm", "start"]
