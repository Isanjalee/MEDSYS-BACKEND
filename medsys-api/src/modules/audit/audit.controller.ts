import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { toSkipTake } from '../../shared/utils/pagination';
import { AuditQueryDto } from './dto/audit-query.dto';

@Controller('audit/logs')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(UserRole.owner)
  async list(@Query() query: AuditQueryDto): Promise<unknown> {
    const { skip, take } = toSkipTake(query.page, query.limit);
    const where = query.entity_type ? { entityType: query.entity_type } : undefined;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }
}
