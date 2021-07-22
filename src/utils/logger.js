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
  console.log(`${formatDate(new Date())} ${colorString('[DEBUG]', consoleColor.green)} ${message}`);
}

function info(message) {
  console.log(`${formatDate(new Date())} ${colorString('[INFO ]', consoleColor.yellow)} ${message}`);
}

function error(message) {
  console.error(`${formatDate(new Date())} ${colorString('[ERROR]', consoleColor.red)} ${message}`);
}

// Formats the given date to the following format:
// DD-MM-YYYY HH:MM:SS
function formatDate(date) {
  const d = `${zfill(date.getDate(), 2)}-${zfill(date.getMonth() + 1, 2)}-${zfill(date.getFullYear(), 4)}`;
  const t = `${zfill(date.getHours(), 2)}:${zfill(date.getMinutes(), 2)}:${zfill(date.getSeconds(), 2)}`;

  return `${d} ${t}`;
}

// Prepends `0` at the beginning of the string until
// the string's length is equal to n.
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
