import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import winston from 'winston';

import 'winston-daily-rotate-file';

const fileTransport = process.env.LOG_FILE_PATH
  ? [
      new winston.transports.DailyRotateFile({
        dirname: process.env.LOG_FILE_PATH,
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.prettyPrint(),
        ),
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '3d',
      }),
    ]
  : [];

export const logger = WinstonModule.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('goals-service', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    ...fileTransport,
  ],
});
