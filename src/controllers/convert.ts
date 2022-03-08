import { Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import SseEvent from '../utils/sse';
import logger from '../utils/logger';
import { convert, FfmpegError, GetInfoError } from '../services/convert';

async function controller(req: Request, res: Response) {
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

  let downloadInfo;
  try {
    downloadInfo = await convert(url, format, (progress) => {
      res.write(
        new SseEvent({
          progress,
        },
        'progress').toString(),
      );
      res.flush();
    });
  } catch (error) {
    if (error instanceof GetInfoError) {
      res.write(new SseEvent({ state: 'get-info-error', info: error.message }, 'error').toString());
    } else if (error instanceof FfmpegError) {
      res.write(new SseEvent({ state: 'ffmpeg-error', info: error.message }, 'error').toString());
    } else {
      throw error;
    }

    return res.end();
  }

  res.write(
    new SseEvent({
      filename: downloadInfo.filename,
      videotitle: downloadInfo.videotitle,
    },
    'done').toString(),
  );
  return res.end();
}

export default controller;
