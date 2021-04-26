/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

const fs = require('fs');
const http = require('http');

const debug = require('debug')('trayzen-yt-downloader:server');
const app = require('../app');

const port = normalizePort(process.env.YTDL_PORT || '3001');
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
  clearDownloadFolder();
});
server.on('error', onError);
server.on('listening', onListening);

function clearDownloadFolder() {
  fs.stat('./downloads/', (err, stat) => {
    if (err) {
      fs.mkdirSync('./downloads/');
    }

    // delete every file except '.gitkeep' in the downloads directory
    fs.readdirSync('./downloads/').forEach((file) => {
      fs.unlinkSync(`./downloads/${file}`);
    });
  });
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const portNumber = parseInt(val, 10);

  if (isNaN(portNumber)) {
    // named pipe
    return val;
  }

  if (portNumber >= 0) {
    // port number
    return portNumber;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const address = server.address();
  const bind = typeof address === 'string'
    ? `pipe ${address}`
    : `port ${address.port}`;
  debug(`Listening on ${bind}`);
}
