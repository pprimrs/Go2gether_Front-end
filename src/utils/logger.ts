// src/utils/logger.ts
import { ENV } from '@/config/env.config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(prefix = 'Go2gether') {
    this.prefix = prefix;
    this.level = ENV.IS_PROD ? LogLevel.WARN : LogLevel.DEBUG;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return ENV.ENABLE_LOGS && level >= this.level;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${this.prefix}] [${level}] ${message}${dataStr}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(
        this.formatMessage('ERROR', message, {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        })
      );
    }

    // In production, send to monitoring service (e.g., Sentry)
    if (ENV.IS_PROD) {
      this.sendToMonitoring(message, error);
    }
  }

  private sendToMonitoring(message: string, error: any): void {
    // TODO: Integrate with Sentry, Bugsnag, or similar
    // Example:
    // Sentry.captureException(error, {
    //   tags: { context: message },
    // });
  }

  // Measure performance
  time(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(`[${this.prefix}] ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(`[${this.prefix}] ${label}`);
    }
  }

  // Group logs
  group(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(`[${this.prefix}] ${label}`);
    }
  }

  groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }
}

export const logger = new Logger();

// Create context-specific loggers
export const createLogger = (context: string) => new Logger(context);