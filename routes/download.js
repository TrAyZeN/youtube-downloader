const ytdl = require('ytdl-core');
const path = require('path');
const logger = require('../utils/logger.js');

const download = (request, response) => {
  // filename is following this norm: videoId.extension ex: RandomId.mp3
  const filename = request.query.file;
  ytdl.getInfo(getVideoIdByFilename(filename), (error) => {
    if (error) {
      logger.error(`Failed to get information ${error}`);
      response.write(`\n${JSON.stringify({ state: 'get-info-error', info: error })}`);
      response.end();
      return;
    }

    const title = request.query.title.replace(/\//g, ' '); // replace every '/' in the title by ' ', to avoid error
    response.download(getPathByFilename(filename), `${title}.${getExtensionByFilename(filename)}`);
  });
};

function getVideoIdByFilename(filename) {
  return filename.split('.')[0];
}

function getExtensionByFilename(filename) {
  return filename.split('.')[1];
}

function getPathByFilename(filename) {
  return path.join('./downloads', filename);
}

module.exports = download;
