FROM node:10.0.0

WORKDIR /root/app/server

COPY package*.json ./
RUN npm i

COPY . ./

CMD npm start
