FROM node:18-alpine

RUN apk add jq curl

ARG USER=default

RUN adduser -D -h /home/$USER -u 1001 $USER

USER $USER

WORKDIR /home/$USER

COPY backend/dist .
COPY frontend/build ./public

CMD [ "node", "dist/server.js" ]