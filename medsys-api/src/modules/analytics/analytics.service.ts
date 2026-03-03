import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(): Promise<unknown> {
    const [patientCount, todayAppointments, pendingAppointments, topDiagnoses] =
      await this.prisma.$transaction([
        this.prisma.patient.count({ where: { isActive: true } }),
        this.prisma.appointment.count({
          where: {
            scheduledAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        }),
        this.prisma.appointment.count({ where: { status: 'waiting' } }),
        this.prisma.$queryRaw<Array<{ diagnosis_name: string; count: bigint }>>`
          SELECT diagnosis_name, COUNT(*)::bigint AS count
          FROM encounter_diagnoses
          GROUP BY diagnosis_name
          ORDER BY COUNT(*) DESC
          LIMIT 10
        `,
      ]);

    return {
      patient_count: patientCount,
      appointments_today: todayAppointments,
      waiting_queue: pendingAppointments,
      top_diagnoses: topDiagnoses.map((item) => ({
        diagnosis_name: item.diagnosis_name,
        count: item.count.toString(),
      })),
    };
  }
}
