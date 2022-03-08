import process from 'process';
import ytdl from 'ytdl-core';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import internal from 'stream';

export enum Format {
  Mp3 = 'mp3',
  Mp4 = 'mp4',
};

export type ProgressCallback = (progress: number) => void;

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const downloadDir = process.env.YTDL_DOWNLOAD_DIR || './downloads';

function downloadProgress(videoInfo: ytdl.videoInfo, format: Format, progressCallback: ProgressCallback | null = null) {
  return new Promise((resolve, reject) => {
    const { videoId } = videoInfo.videoDetails;
    const videoLength = videoInfo.videoDetails.lengthSeconds;
    const filename = `${videoId}.${format}`;
    const filePath = path.join(downloadDir, filename);

    const readStream = ytdl(videoId);

    let command;
    if (format === Format.Mp3) {
      command = downloadAudio(readStream, format);
    } else {
      command = downloadVideo(readStream, format);
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
          progressCallback(getLengthFromTimemark(chunk.timemark) / Number.parseInt(videoLength));
        }
      })
      .on('end', () => {
        logger.info('Video successfully downloaded');
        resolve(null);
      })
      .save(filePath);

    // return command.save(filePath);
  });
}

function downloadAudio(readStream: internal.Readable, format: string): FfmpegCommand {
  return ffmpeg(readStream)
    .toFormat(format)
    .audioBitrate(198)
    .noVideo();
}

function downloadVideo(readStream: internal.Readable, format: string): FfmpegCommand {
  return ffmpeg(readStream)
    .toFormat(format)
    .audioBitrate(198)
    .videoBitrate(1400);
}

// Converts timemark format 'hh:mm:ss.dd' to its length in seconds
function getLengthFromTimemark(timemark: string): number {
  return timemark.slice(0, -3).split(':')
    .map((currentValue, index) => (60 ** (2 - index)) * parseInt(currentValue, 10))
    .reduce((accumulator, currentValue) => accumulator + currentValue);
}

export default downloadProgress;
