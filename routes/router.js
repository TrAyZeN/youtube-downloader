const express = require("express");
const helmet = require("helmet");
const convert = require("./convert.js");
const download = require("./download.js");

const router = express.Router();

router.use(helmet())

router.get("/", (request, response) => {
    response.render("index");
});

router.post("/convert", convert);
router.get("/download", download);

module.exports = router;
