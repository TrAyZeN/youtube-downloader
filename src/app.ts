import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import router from './router';
import errorHandlingMiddleware from './middlewares/errorhandling';

const app = express();

app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

// catch 404 and forward to error handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error: any = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Error handling middleware must be the last app.use
app.use(errorHandlingMiddleware);

export default app;
