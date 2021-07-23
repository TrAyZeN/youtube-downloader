import { Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import ytdl from 'ytdl-core';
import SseEvent from '../utils/sse';
import logger from '../utils/logger';
import download, { Format } from '../services/download';

export async function convert(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  const query = matchedData(req, { locations: ['query'] });
  const { url, format } = query;

  logger.info(`Valid url: '${url}'`);
  res.write(new SseEvent({ state: 'valid-url' }).toString());
  res.flush();

  let info;
  try {
    info = await ytdl.getBasicInfo(url);
    logger.info('Information successfully retrieved');
  } catch (error) {
    logger.error(`Failed to get information: ${error}`);

    res.write(new SseEvent({ state: 'get-info-error', info: error }, 'error').toString());
    return res.end();
  }

  try {
    await download(info, format, (progress) => {
      res.write(
        new SseEvent({
          progress,
        },
        'progress').toString(),
      );
      res.flush();
    });
  } catch (error) {
    res.write(new SseEvent({ state: 'ffmpeg-error', info: error }, 'error').toString());
    return res.end();
  }

  res.write(
    new SseEvent({
      filename: `${info.videoDetails.videoId}.${format}`,
      videotitle: info.videoDetails.title,
    },
    'done').toString(),
  );
  return res.end();
}
