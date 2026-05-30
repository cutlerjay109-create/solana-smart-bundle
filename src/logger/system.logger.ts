import winston from "winston";
import path from "path";

export const systemLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: path.join("logs", "system", "system.log"),
      format: winston.format.json(),
    }),
  ],
});

export const logInfo = (message: string, meta?: object): void => {
  systemLogger.info(message, meta);
};

export const logWarn = (message: string, meta?: object): void => {
  systemLogger.warn(message, meta);
};

export const logError = (message: string, meta?: object): void => {
  systemLogger.error(message, meta);
};

export const logDebug = (message: string, meta?: object): void => {
  systemLogger.debug(message, meta);
};
