FROM node:18-alpine

RUN npm install -g serve

ARG USER=default

RUN adduser -D -h /home/$USER -u 1001 $USER

USER $USER

WORKDIR /home/$USER

COPY package*.json ./

RUN whoami && npm ci

COPY . .

RUN npm run build  && rm -rf node_modules

CMD [ "serve", "-s", "build" ]