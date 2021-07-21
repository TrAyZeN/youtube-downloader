const express = require('express');
const ytdl = require('ytdl-core');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { SseEvent } = require('../utils/sse');
const logger = require('../utils/logger');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const router = express.Router();

router.get('/convert', async (request, response) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  response.writeHead(200, headers);

  const { url, format } = request.query;

  if (!ytdl.validateURL(url)) {
    logger.error(`Invalid url: '${url}'`);
    response.write(new SseEvent({ state: 'invalid-url' }, 'error').toString());
    return response.end();
  }

  logger.info(`Valid url: '${url}'`);
  response.write(new SseEvent({ state: 'valid-url' }).toString());
  response.flush();

  let info;
  try {
    info = await ytdl.getBasicInfo(url);
    logger.info('Information successfully retrieved');
  } catch (error) {
    logger.error(`Failed to get information: ${error}`);

    response.write(new SseEvent({ state: 'get-info-error', info: error }, 'error').toString());
    return response.end();
  }

  return serverDownload(info, format, response);
});

function serverDownload(videoInfo, format, response) {
  const { videoId } = videoInfo.videoDetails;
  const videoTitle = videoInfo.videoDetails.title;
  const videoLength = videoInfo.videoDetails.lengthSeconds;
  const filename = `${videoId}.${format}`;
  const filePath = `downloads/${filename}`;

  const readStream = ytdl(videoId);
  let command;

  if (format === 'mp3') {
    command = downloadAudio(readStream, format);
  } else if (format === 'mp4') {
    command = downloadVideo(readStream, format);
  } else {
    logger.error('Invalid file format');
    response.write(
      new SseEvent({
        state: 'invalid-format-error',
        info: `${format} is not a valid format`,
      },
      'error').toString(),
    );
    return response.end();
  }

  command
    .on('error', (error) => {
      logger.error(error);

      response.write(new SseEvent({ state: 'ffmpeg-error', info: error }, 'error').toString());
      response.end();

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    })
    .on('progress', (chunk) => {
      response.write(
        new SseEvent({
          progress: getLengthFromTimemark(chunk.timemark) / videoLength,
        },
        'progress').toString(),
      );
      response.flush();
    })
    .on('end', () => {
      logger.info('Video successfully downloaded');

      response.write(
        new SseEvent({
          filename,
          videotitle: videoTitle,
        },
        'done').toString(),
      );
      response.end();
    });

  return command.save(filePath);
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

module.exports = router;
