import express, { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const routes = fs.readdirSync(path.join(__dirname, 'routes'));
for (let i = 0; i < routes.length; i++) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  router.use('/api', require(path.join(__dirname, `routes/${routes[i]}`)).default);
  // import(path.join(__dirname, `routes/${routes[i]}`))
  //   .then((module) => module.default)
  //   .then((router: Router) => router.use('/api', router))
  //   .catch((err) => console.error(err));
}

// router.get('/', (_req: Request, res: Response) => {
//   return res.render('index');
// });

export default router;
