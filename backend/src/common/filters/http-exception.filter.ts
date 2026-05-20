import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    private logger = new Logger('AllExceptionsFilter');

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorDetails: any;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'object'
                    ? (exceptionResponse as any).message || exception.message
                    : exception.message;
            errorDetails = exceptionResponse;
        } else if (exception instanceof Error) {
            message = exception.message;
            errorDetails = {
                error: exception.name,
                message: exception.message,
                stack: exception.stack,
            };
        } else {
            errorDetails = exception;
        }

        // Log error to file
        this.logErrorToFile({
            timestamp: new Date().toISOString(),
            status,
            message,
            url: request.url,
            method: request.method,
            ip: request.ip,
            userAgent: request.get('user-agent'),
            body: request.body,
            errorDetails,
            stack: exception instanceof Error ? exception.stack : null,
        });

        // Also log to console for development
        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${message}`,
            exception instanceof Error ? exception.stack : '',
        );

        const responseBody = {
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        httpAdapter.reply(response, responseBody, status);
    }

    private logErrorToFile(errorLog: any): void {
        const logsDir = path.join(process.cwd(), 'logs');

        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        const date = new Date();
        const logFileName = `error-${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;

        const logFilePath = path.join(logsDir, logFileName);
        const logMessage = `\n${JSON.stringify(errorLog, null, 2)}`;

        fs.appendFileSync(logFilePath, logMessage);
    }
}
