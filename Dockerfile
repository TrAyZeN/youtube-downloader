FROM node:lts-alpine

RUN apk add ffmpeg

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn --cwd frontend install

ARG YTDL_PORT=80
ENV NODE_ENV=production

VOLUME /downloads

EXPOSE 80/tcp

CMD ["yarn", "start"]
