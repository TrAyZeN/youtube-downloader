<h1 align="center">
    youtube-downloader
</h1>

> A simple website that permits you to download youtube videos
<div align="center">
    <img src="assets/image.png"/>
</div>

![build](https://api.travis-ci.org/TrAyZeN/youtube-downloader.svg?branch=master)

youtube-downloader is a simple single page website made using [Svelte](https://svelte.dev)
and served by [Express JS](https://expressjs.com/fr/) that lets you download youtube
videos to mp3 or mp4 format.

*You can use the v0.1.0 by clicking [here](https://github.com/TrAyZeN/youtube-downloader/tree/d157f4f468b0986fd69186e2bfb10fe301456f5c).*

## Requirements
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [FFmpeg](https://www.ffmpeg.org)

## Install
```
git clone https://github.com/TrAyZeN/youtube-downloader.git
cd youtube-downloader
yarn install
yarn build
```

## Usage
Once you have followed the [install instructions](##Install) you can
run the following command to start the server.
```
yarn start
```
By default the server will start on port 3001 if you want to change
that see the [environment variables section](##Environment-variables).

## Docker
```
docker build -t youtube-downloader .
docker run -p 3001:80 youtube-downloader
```

## Environment variables
- `YTDL_PORT`: Port on which the server listens for requests. (Default is
  `3001`)
- `YTDL_DOWNLOAD_DIR`: Directory where to download the videos. (Default is
  `./downloads`)

## Contributing
Contributions are welcome! Just [submit a pull request](https://github.com/TrAyZeN/youtube-downloader/compare).

If you want to report a bug or request a feature just [open an issue](https://github.com/TrAyZeN/youtube-downloader/issues/new).

## License
This project is licensed under
[MIT License](https://github.com/TrAyZeN/youtube-downloader/blob/master/LICENSE).
