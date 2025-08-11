FROM node:alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY wait-for-it.sh /usr/app/wait-for-it.sh
RUN chmod +x /usr/app/wait-for-it.sh

RUN apk add --no-cache bash

COPY . .

EXPOSE 5000

CMD ["./wait-for-it.sh", "db:3307", "--", "npm", "start"]
