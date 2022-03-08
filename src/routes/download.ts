import express from 'express';
import { query } from 'express-validator';
import downloadController from '../controllers/download';

const router = express.Router();

router.get(
  '/download',
  [
    query('file', 'Missing \'file\' field.'),
    query('title', 'Missing \'title\' field.')
  ],
  downloadController
);

export default router;
