import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

let Sentry: any = null;
try {
  Sentry = require('@sentry/node');
} catch {
  // @sentry/node not installed — filter works without it
}

/**
 * Global exception filter that reports unhandled errors to Sentry.
 *
 * Usage: app.useGlobalFilters(new SentryExceptionFilter());
 *
 * This filter captures exceptions and sends them to Sentry with
 * request context (path, method, body, user ID). It still returns
 * the standard JSON error response to the client.
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('SentryExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || exception.message;
    }

    // Only report 5xx (server errors) to Sentry
    if (status >= 500 && Sentry) {
      Sentry.withScope((scope: any) => {
        scope.setTag('status_code', status);
        scope.setContext('request', {
          method: request.method,
          url: request.url,
          path: request.path,
          body: request.body,
          query: request.query,
          headers: {
            'user-agent': request.headers['user-agent'],
            'content-type': request.headers['content-type'],
          },
        });

        // Attach user info if available (e.g. from JWT auth guard)
        const user = (request as any).user;
        if (user) {
          scope.setUser({
            id: user.id || user.sub,
            email: user.email,
          });
        }

        if (exception instanceof Error) {
          Sentry.captureException(exception);
        } else {
          Sentry.captureMessage(String(exception), 'error');
        }
      });
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }
}
