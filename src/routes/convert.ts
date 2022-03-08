import express from 'express';
import { query } from 'express-validator';
import ytdl from 'ytdl-core';
import convertController from '../controllers/convert';

const router = express.Router();

const supportedFormats = ['mp3', 'mp4'];

router.get(
  '/convert',
  [
    query('format', 'Missing \'query\' field.')
      .isIn(supportedFormats)
      .withMessage('Invalid format.'),
    query('url', 'Missing \'url\' field.')
      .custom((url) => ytdl.validateURL(url))
      .withMessage('Invalid url.')
  ],
  convertController
);

export default router;
