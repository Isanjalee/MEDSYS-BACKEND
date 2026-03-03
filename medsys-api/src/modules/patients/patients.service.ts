import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { toSkipTake } from '../../shared/utils/pagination';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto): Promise<unknown> {
    const { skip, take } = toSkipTake(query.page, query.limit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { allergies: true },
      }),
      this.prisma.patient.count(),
    ]);
    return { data, meta: { page: query.page, limit: query.limit, total } };
  }

  async create(dto: CreatePatientDto): Promise<unknown> {
    return this.prisma.patient.create({
      data: {
        uuid: randomUUID(),
        nic: dto.nic,
        fullName: dto.full_name,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        gender: dto.gender,
        phone: dto.phone,
        address: dto.address,
        bloodGroup: dto.blood_group,
        allergies: dto.allergies
          ? {
              create: dto.allergies.map((item) => ({
                allergyName: item.allergy_name,
              })),
            }
          : undefined,
      },
      include: { allergies: true },
    });
  }

  async update(id: bigint, dto: UpdatePatientDto): Promise<unknown> {
    const existing = await this.prisma.patient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.patient.update({
      where: { id },
      data: {
        nic: dto.nic,
        fullName: dto.full_name,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        gender: dto.gender,
        phone: dto.phone,
        address: dto.address,
        bloodGroup: dto.blood_group,
      },
      include: { allergies: true },
    });
  }
}
