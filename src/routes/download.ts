import express from 'express';
import { query } from 'express-validator';
import { download } from '../controllers/download';

const router = express.Router();

router.get(
  '/download',
  [
    query('file', 'Missing \'file\' field.'),
    query('title', 'Missing \'title\' field.')
  ],
  download
);

export default router;
