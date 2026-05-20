import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
    private logger = new Logger('AppLogger');

    private ensureLogsDirectory(): void {
        const logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
    }

    private getLogFileName(type: 'error' | 'info' | 'warn' | 'debug'): string {
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        return `${type}-${dateStr}.log`;
    }

    private writeToFile(
        logFileName: string,
        message: string,
        data?: any,
    ): void {
        this.ensureLogsDirectory();
        const logsDir = path.join(process.cwd(), 'logs');
        const logFilePath = path.join(logsDir, logFileName);

        const logEntry = {
            timestamp: new Date().toISOString(),
            message,
            ...(data && { data }),
        };

        fs.appendFileSync(
            logFilePath,
            `\n${JSON.stringify(logEntry, null, 2)}`,
        );
    }

    error(message: string, error?: any, context?: string): void {
        const logContext = context || 'Error';
        this.logger.error(message, error?.stack || '');
        this.writeToFile(this.getLogFileName('error'), message, {
            error: error?.message || error,
            stack: error?.stack,
        });
    }

    warn(message: string, context?: string): void {
        this.logger.warn(message);
        this.writeToFile(this.getLogFileName('warn'), message);
    }

    log(message: string, data?: any, context?: string): void {
        this.logger.log(message);
        this.writeToFile(this.getLogFileName('info'), message, data);
    }

    debug(message: string, data?: any): void {
        this.logger.debug(message);
        if (process.env.NODE_ENV === 'development') {
            this.writeToFile(this.getLogFileName('debug'), message, data);
        }
    }
}
