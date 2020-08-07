const ytdl = require('ytdl-core');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const logger = require('../utils/logger.js');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const convert = async (request, response) => {
  const videoUrl = request.body.videourl;
  const { format } = request.body;

  if (ytdl.validateURL(videoUrl) === true) {
    logger.info(`Valid url: ${videoUrl}`);
    response.write(JSON.stringify({ state: 'valid-url' }));
  } else {
    logger.error(`Invalid url: ${videoUrl}`);
    response.send(JSON.stringify({ state: 'invalid-url' }));
    return response.end();
  }

  let info;
  try {
    info = await ytdl.getBasicInfo(videoUrl);
    logger.info('Information successfully retrieved');
  } catch (error) {
    logger.error(`Failed to get information: ${error}`);
    response.write(`\n${JSON.stringify({ state: 'get-info-error', info: error })}`);
    return response.end();
  }

  return serverDownload(info, format, response);
};

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
    response.write(`\n${JSON.stringify({
      state: 'invalid-format-error',
      info: `${format} is not a valid format`,
    })}`);
    return response.end();
  }

  command
    .on('error', (error) => {
      logger.error(error);
      response.write(`\n${JSON.stringify({
        state: 'ffmpeg-error',
        info: error,
      })}`);
      response.end();
      if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
    })
    .on('progress', (chunk) => {
      response.write(`\n${JSON.stringify({
        state: 'download-progress',
        percentage: getLengthFromTimemark(chunk.timemark) / videoLength,
      })}`);
    })
    .on('end', () => {
      logger.info('Video successfully downloaded');
      response.write(`\n${JSON.stringify({
        state: 'server-download-finished',
        filename,
        videotitle: videoTitle,
      })}`);
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

// convert timemark format 'hh:mm:ss.dd' to its length in seconds
function getLengthFromTimemark(timemark) {
  return timemark.slice(0, -3).split(':')
    .map((currentValue, index) => (60 ** (2 - index)) * parseInt(currentValue, 10))
    .reduce((accumulator, currentValue) => accumulator + currentValue);
}

module.exports = convert;
