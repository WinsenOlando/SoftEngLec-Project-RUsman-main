FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm init -y
RUN npm install --force --legacy-peer-deps
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]