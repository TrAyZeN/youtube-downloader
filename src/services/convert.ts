import ytdl from 'ytdl-core';
import logger from '../utils/logger';
import download, { Format, ProgressCallback } from './download';

export class GetInfoError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'GetInfoError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class FfmpegError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'FfmpegError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export async function convert(url: string, format: Format, progressCallback: ProgressCallback | null = null) {
  let info;
  try {
    info = await ytdl.getBasicInfo(url);
    logger.info('Information successfully retrieved');
  } catch (error) {
    logger.error(`Failed to get information: ${error}`);
    if (error instanceof Error) {
      throw new GetInfoError(error.message);
    }

    throw error;
  }

  try {
    await download(info, format, progressCallback);
  } catch (error) {
    logger.error(`Ffmpeg error: ${error}`);
    if (error instanceof Error) {
      throw new FfmpegError(error.message);
    }

    throw error;
  }

  return {
    filename: `${info.videoDetails.videoId}.${format}`,
    videotitle: info.videoDetails.title,
  };
}
