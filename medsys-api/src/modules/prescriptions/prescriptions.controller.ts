import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { RequestWithContext } from '../../shared/types/request-context';
import { AuditService } from '../audit/audit.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionsService } from './prescriptions.service';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  async create(
    @Body() body: CreatePrescriptionDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const created = await this.prescriptionsService.create(body);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'created',
      entityType: 'prescription',
      entityId: BigInt((created as { id: bigint }).id.toString()),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return created;
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const record = await this.prescriptionsService.getById(BigInt(id));
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'viewed',
      entityType: 'prescription',
      entityId: BigInt(id),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return record;
  }
}
