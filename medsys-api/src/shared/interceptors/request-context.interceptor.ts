import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import type { RequestWithContext } from '../types/request-context';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly requestIdFactory: () => string) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<RequestWithContext>();
    const res = context.switchToHttp().getResponse<FastifyReply>();
    const incomingId = req.headers['x-request-id'];
    const requestId = typeof incomingId === 'string' ? incomingId : this.requestIdFactory();
    req.requestId = requestId;
    res.header('x-request-id', requestId);
    return next.handle();
  }
}
