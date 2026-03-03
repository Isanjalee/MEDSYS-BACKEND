import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto): Promise<unknown> {
    const encounter = await this.prisma.encounter.findUnique({
      where: { id: BigInt(dto.encounter_id) },
    });
    if (!encounter) {
      throw new NotFoundException('Encounter not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const prescription = await tx.prescription.create({
        data: {
          encounterId: BigInt(dto.encounter_id),
          patientId: BigInt(dto.patient_id),
          doctorId: BigInt(dto.doctor_id),
          items: {
            create: dto.items.map((item) => ({
              drugName: item.drug_name,
              dose: item.dose,
              frequency: item.frequency,
              duration: item.duration,
              quantity: item.quantity,
              source: item.source,
            })),
          },
        },
      });
      return tx.prescription.findUnique({
        where: { id: prescription.id },
        include: { items: true },
      });
    });
  }

  async getById(id: bigint): Promise<unknown> {
    const record = await this.prisma.prescription.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!record) {
      throw new NotFoundException('Prescription not found');
    }
    return record;
  }
}
