const ytdl = require('ytdl-core');
const { SseEvent } = require('../utils/sse');
const logger = require('../utils/logger');
const download = require('../services/download');

async function convert(request, response) {
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
    // TODO: Handle Invalid format
    logger.error(`Failed to get information: ${error}`);

    response.write(new SseEvent({ state: 'get-info-error', info: error }, 'error').toString());
    return response.end();
  }

  try {
    await download(info, format, (progress) => {
      response.write(
        new SseEvent({
          progress,
        },
        'progress').toString(),
      );
      response.flush();
    });
  } catch (error) {
    response.write(new SseEvent({ state: 'ffmpeg-error', info: error }, 'error').toString());
    return response.end();
  }

  response.write(
    new SseEvent({
      filename: `${info.videoDetails.videoId}.${format}`,
      videotitle: info.videoDetails.title,
    },
    'done').toString(),
  );
  return response.end();
}

module.exports = {
  convert,
};
