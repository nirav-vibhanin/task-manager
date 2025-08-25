import fs from 'fs';
import path from 'path';
import winston from 'winston';
import stream from 'stream';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' })
  ]
});

export const morganStream = new stream.Writable({
  write(chunk, _encoding, callback) {
    logger.info(chunk.toString().trim());
    callback();
  }
});
