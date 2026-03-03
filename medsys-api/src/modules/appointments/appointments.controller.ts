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
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import type { RequestWithContext } from '../../shared/types/request-context';
import { AuditService } from '../audit/audit.service';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  list(@Query() query: PaginationDto): Promise<unknown> {
    return this.appointmentsService.list(query);
  }

  @Post()
  async create(
    @Body() body: CreateAppointmentDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const created = await this.appointmentsService.create(body);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'created',
      entityType: 'appointment',
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
    @Body() body: UpdateAppointmentDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const updated = await this.appointmentsService.update(BigInt(id), body);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'updated',
      entityType: 'appointment',
      entityId: BigInt(id),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return updated;
  }
}
