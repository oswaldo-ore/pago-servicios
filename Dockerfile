FROM node:latest

WORKDIR /usr/src/aapp

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm","start"]