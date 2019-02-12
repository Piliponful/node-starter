FROM node:10.0.0

WORKDIR /root/app/server

COPY package*.json ./
RUN npm i

COPY . ./

RUN chmod 777 ./wait-for-it.sh

CMD ./wait-for-it.sh mongodb:27017 -- touch logs/log && npm start
