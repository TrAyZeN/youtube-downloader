const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const routes = fs.readdirSync(path.join(__dirname, 'routes'));
for (let i = 0; i < routes.length; i++) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  router.use('/api', require(path.join(__dirname, `routes/${routes[i]}`)));
}

router.get('/', (request, response) => {
  response.render('index');
});

module.exports = router;
