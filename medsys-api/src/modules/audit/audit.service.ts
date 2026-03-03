import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

interface AuditInput {
  actorUserId?: bigint;
  entityType: string;
  entityId?: bigint;
  action: string;
  ip?: string;
  userAgent?: string | string[];
  requestId: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditInput): Promise<void> {
    const userAgent = Array.isArray(input.userAgent) ? input.userAgent.join(', ') : input.userAgent;
    await this.prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        ip: input.ip,
        userAgent,
        requestId: input.requestId,
        payload: input.payload as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
