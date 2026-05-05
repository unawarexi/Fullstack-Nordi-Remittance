import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// ============================================================================
// FORMATS
// ============================================================================

// Colorized human-readable format for local development console
const devConsoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.meta ? " " + JSON.stringify(info.meta) : ""}`,
  ),
);

// Structured JSON format for file transports and production.
// This is what Filebeat/Logstash picks up for ELK ingestion.
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Production console: plain JSON (Docker log driver collects stdout)
const prodConsoleFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

const isProduction = process.env.NODE_ENV === "production";

// ============================================================================
// TRANSPORTS
// ============================================================================

const transports: winston.transport[] = [
  // Console — colorized in dev, JSON in production (stdout → Docker log driver)
  new winston.transports.Console({
    format: isProduction ? prodConsoleFormat : devConsoleFormat,
  }),
  // Error log: JSON so Filebeat can ship it to ELK
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/error.log"),
    level: "error",
    format: jsonFormat,
    maxsize: 10 * 1024 * 1024, // 10 MB
    maxFiles: 5,
    tailable: true,
  }),
  // All logs: JSON for Filebeat → Logstash → Elasticsearch
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/all.log"),
    format: jsonFormat,
    maxsize: 50 * 1024 * 1024, // 50 MB
    maxFiles: 10,
    tailable: true,
  }),
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // Exceptions and rejections go to a separate file AND are re-emitted to ELK
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/exceptions.log"),
      format: jsonFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/rejections.log"),
      format: jsonFormat,
    }),
  ],
});

// ============================================================================
// CONTEXT LOGGER FACTORY
// Wraps the Winston singleton with a context prefix so services can do:
//   const log = createLogger("BullMQ");
//   log.info("Queue initialised");
// ============================================================================

export interface ContextLogger {
  error(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  http(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
  /** Alias for info with a ✓ prefix — keeps parity with Speakup logger */
  success(message: string, data?: Record<string, unknown>): void;
}

export function createLogger(context: string): ContextLogger {
  const prefix = `[${context}]`;

  const fmt = (msg: string) => `${prefix} ${msg}`;

  return {
    error: (message, data) =>
      Logger.error(fmt(message), data ? { meta: data } : undefined),
    warn: (message, data) =>
      Logger.warn(fmt(message), data ? { meta: data } : undefined),
    info: (message, data) =>
      Logger.info(fmt(message), data ? { meta: data } : undefined),
    http: (message, data) =>
      Logger.http(fmt(message), data ? { meta: data } : undefined),
    debug: (message, data) =>
      Logger.debug(fmt(message), data ? { meta: data } : undefined),
    success: (message, data) =>
      Logger.info(`${prefix} ✓ ${message}`, data ? { meta: data } : undefined),
  };
}

// ============================================================================
// ELK TRANSPORT WIRING
// Called by elkstack.logs.ts after the Elasticsearch client connects so all
// subsequent log lines are also shipped to Elasticsearch.
// ============================================================================

export function addElkTransport(transport: winston.transport): void {
  Logger.add(transport);
}

export default Logger;
