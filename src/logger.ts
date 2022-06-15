import chalk from "chalk";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const winston = require('winston');
const format = winston.format
const transports = winston.transports
const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.splat(),
    format.timestamp({format: "YYYY-MM-dd HH:mm:ss"}),
    format.align(),
    format.printf((i: { level: any; timestamp: any; message: any; }) => {
      return `${chalk.cyan([i.timestamp])} -> [${i.level.toUpperCase()}\t] -> ${i.message}`
    })
  ),
  transports: [
    new transports.Console(),
  ],
});

export function disableLog() {
  logger.level = 'none';
}

export function createLogger(silent?: Boolean) {
  console.log(silent)
  if (silent === false || silent === null) {
    disableLog();
  }
  return logger;
}
