import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithContext } from '../types/request-context';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestWithContext['user'] => {
    const request = ctx.switchToHttp().getRequest<RequestWithContext>();
    return request.user;
  },
);
