const ytdl = require('ytdl-core');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const downloadDir = process.env.YTDL_DOWNLOAD_DIR || './downloads';

function download(videoInfo, format, progressCallback = null) {
  return new Promise((resolve, reject) => {
    const { videoId } = videoInfo.videoDetails;
    const videoLength = videoInfo.videoDetails.lengthSeconds;
    const filename = `${videoId}.${format}`;
    const filePath = path.join(downloadDir, filename);

    const readStream = ytdl(videoId);

    let command;
    if (format === 'mp3') {
      command = downloadAudio(readStream, format);
    } else if (format === 'mp4') {
      command = downloadVideo(readStream, format);
    } else {
      logger.error('Invalid file format');
      reject();
    }

    command
      .on('error', (error) => {
        logger.error(error);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        reject(error);
      })
      .on('progress', (chunk) => {
        if (progressCallback) {
          progressCallback(getLengthFromTimemark(chunk.timemark) / videoLength);
        }
      })
      .on('end', () => {
        logger.info('Video successfully downloaded');
        resolve();
      })
      .save(filePath);

    // return command.save(filePath);
  });
}

function downloadAudio(readStream, format) {
  return ffmpeg(readStream)
    .toFormat(format)
    .audioBitrate(198)
    .noVideo();
}

function downloadVideo(readStream, format) {
  return ffmpeg(readStream)
    .toFormat(format)
    .audioBitrate(198)
    .videoBitrate(1400);
}

// Converts timemark format 'hh:mm:ss.dd' to its length in seconds
function getLengthFromTimemark(timemark) {
  return timemark.slice(0, -3).split(':')
    .map((currentValue, index) => (60 ** (2 - index)) * parseInt(currentValue, 10))
    .reduce((accumulator, currentValue) => accumulator + currentValue);
}

module.exports = download;
