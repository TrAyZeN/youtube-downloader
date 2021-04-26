<h1 align="center">
    youtube-downloader
</h1>

> A simple website that permits you to download youtube videos
<div align="center">
    <img src="assets/image.png"/>
</div>

![build](https://api.travis-ci.org/TrAyZeN/youtube-downloader.svg?branch=master)

youtube-downloader is a simple single page website running under nodejs using
express that lets you download youtube videos to mp3 or mp4 format.

## Requirements
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [FFmpeg](https://www.ffmpeg.org)

## Install
```
git clone https://github.com/TrAyZeN/youtube-downloader.git
cd youtube-downloader
yarn install
```

## Usage
```
yarn start
```

## Docker
```
docker build -t youtube-downloader .
docker run -p 3000:80 youtube-downloader
```

## Environment variables
- `YTDL_PORT`: Port on which the server listens for requests. (Default is
  `3001`)

## License
This project licensed under
[MIT License](https://github.com/TrAyZeN/youtube-downloader/blob/master/LICENSE).

