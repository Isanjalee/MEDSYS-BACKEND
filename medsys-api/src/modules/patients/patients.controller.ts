import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { RequestWithContext } from '../../shared/types/request-context';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { AuditService } from '../audit/audit.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  async list(
    @Query() query: PaginationDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const result = await this.patientsService.list(query);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'viewed',
      entityType: 'patient',
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      payload: { endpoint: 'GET /patients' },
    });
    return result;
  }

  @Post()
  async create(
    @Body() body: CreatePatientDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const created = await this.patientsService.create(body);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'created',
      entityType: 'patient',
      entityId: BigInt((created as { id: bigint }).id.toString()),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return created;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePatientDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const updated = await this.patientsService.update(BigInt(id), body);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'updated',
      entityType: 'patient',
      entityId: BigInt(id),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return updated;
  }
}
