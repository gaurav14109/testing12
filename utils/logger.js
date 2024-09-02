const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const morgan = require("morgan");
class Logger {
  logger;
  constructor(service = "general-purpose") {
    if (!Logger.instance) {
      this.logger = winston.createLogger({
        defaultMeta: { service },
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`
          )
        ),
        transports: [
          new winston.transports.Console(),
          this.getHttpLoggerTransport(),
          this.getInfoLoggerTransport(),
          this.getErrorLoggerTransport(),
        ],
      });

      if (process.env.NODE_ENV !== "production") {
        this.logger.add(
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          })
        );
      }
    }
  }
  info = (message) => {
    this.logger.info(message);
  };

  error = (message) => {
    this.logger.error(message);
  };

  errorFilter = winston.format((info, opts) => {
    return info.level === "error" ? info : false;
  });

  infoFilter = winston.format((info, opts) => {
    return info.level === "info" ? info : false;
  });

  httpFilter = winston.format((info, opts) => {
    return info.level === "http" ? info : false;
  });

  getInfoLoggerTransport = () => {
    return new DailyRotateFile({
      filename: "logs/info-%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "1k",
      maxFiles: "1m",
      level: "info",
      format: winston.format.combine(
        this.infoFilter(),
        winston.format.timestamp(),
        winston.format.json()
      ),
    });
  };
  getErrorLoggerTransport = () => {
    return new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "1k",
      maxFiles: "1m",
      level: "error",
      format: winston.format.combine(
        this.errorFilter(),
        winston.format.timestamp(),
        winston.format.json()
      ),
    });
  };
  getHttpLoggerTransport = () => {
    return new DailyRotateFile({
      filename: "logs/http-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "1k",
      maxFiles: "1m",
      level: "http",
      format: winston.format.combine(
        this.httpFilter(),
        winston.format.timestamp(),
        winston.format.json()
      ),
    });
  };

  getHttpLoggerInstance = () => {
    const stream = {
      write: (message) => this.logger.http(message),
    };
    const skip = () => {
      const env = process.env.NODE_ENV || "development";
      return env !== "development";
    };
    const morganMiddleware = morgan(
      ":method :url :status :res[content-length] - :response-time ms :remote-addr",
      {
        stream,
        skip,
      }
    );
    return morganMiddleware;
  };

  
}

const instance = new Logger();
Object.freeze(instance);
module.exports = instance;
