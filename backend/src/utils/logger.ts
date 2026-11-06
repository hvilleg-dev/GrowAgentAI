import winston, { Logger, format, transports } from 'winston';

const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0 && !meta.stack) {
      metaStr = ` ${JSON.stringify(meta)}`;
    }
    if (meta.stack) {
      metaStr = `\n${meta.stack}`;
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

const logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

export default logger;
