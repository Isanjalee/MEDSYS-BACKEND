import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { RequestWithContext } from '../types/request-context';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<RequestWithContext>();
    const requestId = request.requestId ?? 'unknown';
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).send({
        error: {
          code: exception.getStatus(),
          message: exception.message,
          request_id: requestId,
          timestamp,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      error: {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        request_id: requestId,
        timestamp,
      },
    });
  }
}
