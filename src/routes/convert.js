const express = require('express');
const { convert } = require('../controllers/convert');

const router = express.Router();

router.get('/convert', convert);

module.exports = router;
