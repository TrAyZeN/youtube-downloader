FROM node:lts-alpine

RUN apk add ffmpeg

WORKDIR /app

COPY package.json yarn.lock ./
COPY src src
COPY public public

RUN ls

RUN yarn install

ENV YTDL_PORT=80 \
    NODE_ENV=production


VOLUME /downloads

EXPOSE 80/tcp

CMD ["yarn", "start"]

