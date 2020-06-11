/* eslint-disable no-console */

const consoleColor = {
  reset: '\x1b[0m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  blackBg: '\x1b[40m',
  redBg: '\x1b[41m',
  greenBg: '\x1b[42m',
  yellowBg: '\x1b[43m',
  blueBg: '\x1b[44m',
  magentaBg: '\x1b[45m',
  cyanBg: '\x1b[46m',
  whiteBg: '\x1b[47m',
};

function colorString(str, color) {
  return color + str + consoleColor.reset;
}

// eslint-disable-next-line no-unused-vars
function debug(message) {
  console.log(`${formatedCurrentDate()} ${colorString('[DEBUG]', consoleColor.green)} ${message}`);
}

function info(message) {
  console.log(`${formatedCurrentDate()} ${colorString('[INFO ]', consoleColor.yellow)} ${message}`);
}

function error(message) {
  console.error(`${formatedCurrentDate()} ${colorString('[ERROR]', consoleColor.red)} ${message}`);
}

function formatedCurrentDate() {
  const now = new Date();
  const date = `${zfill(now.getDate(), 2)}-${zfill(now.getMonth() + 1, 2)}-${zfill(now.getFullYear(), 4)}`;
  const time = `${zfill(now.getHours(), 2)}:${zfill(now.getMinutes(), 2)}:${zfill(now.getSeconds(), 2)}`;

  return `${date} ${time}`;
}

function zfill(str, n) {
  let result = str.toString();
  let i = result.length;

  while (i < n) {
    result = `0${result}`;
    i += 1;
  }

  return result;
}

module.exports = {
  info,
  error,
};
