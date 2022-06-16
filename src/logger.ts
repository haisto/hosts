import chalk from "chalk";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const winston = require('winston');
const format = winston.format
const transports = winston.transports
const logger = winston.createLogger({
  level: 'none',
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

export const log = logger;

export const setLogLevel = (silent?: string) => {
  if ((silent === undefined || silent.length <= 0) && silent !== 'true') {
    logger.level = 'none';
    console.log("Logger level: none")
  } else {
    logger.level = silent
    console.log("Logger level: " + logger.level)
  }
  console.log(silent, logger.level)
}
