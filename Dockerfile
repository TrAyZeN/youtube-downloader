FROM node:lts-alpine

RUN apk add ffmpeg

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn --cwd frontend install

RUN yarn build

ENV YTDL_PORT=80 \
    NODE_ENV=production

VOLUME /downloads

EXPOSE 80/tcp

CMD ["yarn", "start"]
