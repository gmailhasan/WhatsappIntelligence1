
import winston from 'winston';
import 'winston-daily-rotate-file';

const dailyRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  dirname: '.', // or specify a logs directory
  maxFiles: '14d', // keep logs for 14 days
  zippedArchive: true,
});

class Logger {
  private static instance: winston.Logger;

  private constructor() {}

  public static getInstance(): winston.Logger {
    if (!Logger.instance) {
      Logger.instance = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
          })
        ),
        transports: [
          new winston.transports.Console(),
          dailyRotateTransport,
        ],
      });
    }
    return Logger.instance;
  }
}


export const logger = Logger.getInstance();
