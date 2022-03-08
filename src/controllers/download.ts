import { Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import process from 'process';
import ytdl from 'ytdl-core';
import path from 'path';
import logger from '../utils/logger';

const downloadDir = process.env.YTDL_DOWNLOAD_DIR || './downloads';

async function controller(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const query = matchedData(req, { locations: ['query']});

  // filename is following this norm: videoId.extension ex: RandomId.mp3
  const filename = query.file;

  try {
    await ytdl.getInfo(getVideoIdByFilename(filename));
  } catch (error) {
    logger.error(`Failed to get information ${error}`);
    res.write(`\n${JSON.stringify({ state: 'get-info-error', info: error })}`);
    return res.end();
  }

  const title = query.title.replace(/\//g, ' '); // replace every '/' in the title by ' ', to avoid error
  return res.download(getPathByFilename(filename), `${title}.${getExtensionByFilename(filename)}`);
}

function getVideoIdByFilename(filename: string): string {
  return filename.split('.')[0];
}

function getExtensionByFilename(filename: string): string {
  return filename.split('.')[1];
}

function getPathByFilename(filename: string): string {
  return path.join(downloadDir, filename);
}

export default controller;
