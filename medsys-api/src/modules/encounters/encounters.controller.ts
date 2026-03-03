import { Body, Controller, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { RequestWithContext } from '../../shared/types/request-context';
import { AuditService } from '../audit/audit.service';
import { AddDiagnosisDto } from './dto/add-diagnosis.dto';
import { AddTestDto } from './dto/add-test.dto';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { EncountersService } from './encounters.service';

@Controller('encounters')
export class EncountersController {
  constructor(
    private readonly encountersService: EncountersService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @Roles(UserRole.doctor)
  async create(
    @Body() body: CreateEncounterDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const created = await this.encountersService.create(body);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'created',
      entityType: 'encounter',
      entityId: BigInt((created as { id: bigint }).id.toString()),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return created;
  }

  @Post(':id/diagnoses')
  @Roles(UserRole.doctor)
  async addDiagnosis(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddDiagnosisDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const created = await this.encountersService.addDiagnosis(BigInt(id), body);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'created',
      entityType: 'diagnosis',
      entityId: BigInt((created as { id: bigint }).id.toString()),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return created;
  }

  @Post(':id/tests')
  @Roles(UserRole.doctor, UserRole.assistant)
  async addTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddTestDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const created = await this.encountersService.addTest(BigInt(id), body);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'created',
      entityType: 'test_order',
      entityId: BigInt((created as { id: bigint }).id.toString()),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return created;
  }
}
