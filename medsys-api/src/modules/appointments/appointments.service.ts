import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { toSkipTake } from '../../shared/utils/pagination';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto): Promise<unknown> {
    const { skip, take } = toSkipTake(query.page, query.limit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        skip,
        take,
        orderBy: { scheduledAt: 'asc' },
        include: { patient: true, doctor: true, assistant: true },
      }),
      this.prisma.appointment.count(),
    ]);
    return { data, meta: { page: query.page, limit: query.limit, total } };
  }

  async create(dto: CreateAppointmentDto): Promise<unknown> {
    return this.prisma.appointment.create({
      data: {
        patientId: BigInt(dto.patient_id),
        doctorId: dto.doctor_id ? BigInt(dto.doctor_id) : undefined,
        assistantId: dto.assistant_id ? BigInt(dto.assistant_id) : undefined,
        scheduledAt: new Date(dto.scheduled_at),
        status: dto.status,
        reason: dto.reason,
        priority: dto.priority,
      },
      include: { patient: true, doctor: true, assistant: true },
    });
  }

  async update(id: bigint, dto: UpdateAppointmentDto): Promise<unknown> {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }
    return this.prisma.appointment.update({
      where: { id },
      data: {
        patientId: dto.patient_id ? BigInt(dto.patient_id) : undefined,
        doctorId: dto.doctor_id ? BigInt(dto.doctor_id) : undefined,
        assistantId: dto.assistant_id ? BigInt(dto.assistant_id) : undefined,
        scheduledAt: dto.scheduled_at ? new Date(dto.scheduled_at) : undefined,
        status: dto.status,
        reason: dto.reason,
        priority: dto.priority,
      },
      include: { patient: true, doctor: true, assistant: true },
    });
  }
}
