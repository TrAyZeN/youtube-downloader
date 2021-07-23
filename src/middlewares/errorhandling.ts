import { Request, Response, NextFunction } from 'express';

function errorHandlingMiddleware(err: any, _req: Request, res: Response, next: NextFunction) {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({ error: err.message });
};

export default errorHandlingMiddleware;
