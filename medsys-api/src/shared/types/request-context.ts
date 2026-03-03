import type { FastifyRequest } from 'fastify';
import type { UserRole } from '@prisma/client';

export interface AuthUser {
  sub: string;
  role: UserRole;
  email: string;
}

export interface RequestWithContext extends FastifyRequest {
  requestId?: string;
  user?: AuthUser;
}
