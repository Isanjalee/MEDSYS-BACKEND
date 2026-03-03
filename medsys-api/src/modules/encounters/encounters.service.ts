import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AddDiagnosisDto } from './dto/add-diagnosis.dto';
import { AddTestDto } from './dto/add-test.dto';
import { CreateEncounterDto } from './dto/create-encounter.dto';

@Injectable()
export class EncountersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEncounterDto): Promise<unknown> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: BigInt(dto.appointment_id) },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return this.prisma.encounter.create({
      data: {
        appointmentId: BigInt(dto.appointment_id),
        patientId: BigInt(dto.patient_id),
        doctorId: BigInt(dto.doctor_id),
        notes: dto.notes,
        nextVisitDate: dto.next_visit_date ? new Date(dto.next_visit_date) : undefined,
      },
      include: { diagnoses: true, testOrders: true },
    });
  }

  async addDiagnosis(encounterId: bigint, dto: AddDiagnosisDto): Promise<unknown> {
    const encounter = await this.prisma.encounter.findUnique({ where: { id: encounterId } });
    if (!encounter) {
      throw new NotFoundException('Encounter not found');
    }
    return this.prisma.encounterDiagnosis.create({
      data: {
        encounterId,
        icd10Code: dto.icd10_code,
        diagnosisName: dto.diagnosis_name,
      },
    });
  }

  async addTest(encounterId: bigint, dto: AddTestDto): Promise<unknown> {
    const encounter = await this.prisma.encounter.findUnique({ where: { id: encounterId } });
    if (!encounter) {
      throw new NotFoundException('Encounter not found');
    }
    return this.prisma.testOrder.create({
      data: {
        encounterId,
        testName: dto.test_name,
      },
    });
  }
}
