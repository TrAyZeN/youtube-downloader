import express from 'express';
import { query } from 'express-validator';
import ytdl from 'ytdl-core';
import { convert } from '../controllers/convert';

const router = express.Router();

router.get(
  '/convert',
  [
    query('format', 'Missing \'query\' field.').isIn(['mp3', 'mp4']).withMessage('Invalid format.'),
    query('url', 'Missing \'url\' field.').custom((url) => ytdl.validateURL(url)).withMessage('Invalid url.')
  ],
  convert
);

export default router;
