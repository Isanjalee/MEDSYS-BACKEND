import {
  AllergySeverity,
  AppointmentStatus,
  DrugSource,
  Gender,
  InventoryCategory,
  InventoryMovementType,
  PriorityLevel,
  PrismaClient,
  TestOrderStatus,
  UserRole,
} from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const defaultPassword = await argon2.hash('ChangeMe123!');

  // Clear data in FK-safe order for repeatable seeds in local/dev.
  await prisma.auditLog.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.testOrder.deleteMany();
  await prisma.encounterDiagnosis.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patientAllergy.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const owners = await Promise.all(
    Array.from({ length: 2 }).map((_, index) =>
      prisma.user.create({
        data: {
          uuid: randomUUID(),
          email: `owner${index + 1}@medsys.local`,
          passwordHash: defaultPassword,
          fullName: `Owner ${index + 1}`,
          role: UserRole.owner,
          isActive: true,
        },
      }),
    ),
  );

  const doctors = await Promise.all(
    Array.from({ length: 5 }).map((_, index) =>
      prisma.user.create({
        data: {
          uuid: randomUUID(),
          email: `doctor${index + 1}@medsys.local`,
          passwordHash: defaultPassword,
          fullName: `Doctor ${index + 1}`,
          role: UserRole.doctor,
          isActive: true,
        },
      }),
    ),
  );

  const assistants = await Promise.all(
    Array.from({ length: 5 }).map((_, index) =>
      prisma.user.create({
        data: {
          uuid: randomUUID(),
          email: `assistant${index + 1}@medsys.local`,
          passwordHash: defaultPassword,
          fullName: `Assistant ${index + 1}`,
          role: UserRole.assistant,
          isActive: true,
        },
      }),
    ),
  );

  const users = [...owners, ...doctors, ...assistants];

  const refreshTokenRows = Array.from({ length: 10 }).map((_, index) => {
    const rawToken = `seed-refresh-token-${index + 1}`;
    return {
      userId: users[index % users.length].id,
      tokenHash: createHash('sha256').update(rawToken).digest('hex'),
      expiresAt: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
      revokedAt: index % 4 === 0 ? new Date() : null,
    };
  });
  await prisma.refreshToken.createMany({ data: refreshTokenRows });

  const patients = await Promise.all(
    Array.from({ length: 12 }).map((_, index) =>
      prisma.patient.create({
        data: {
          uuid: randomUUID(),
          nic: `1990${(index + 1).toString().padStart(8, '0')}`,
          fullName: `Patient ${index + 1}`,
          dob: new Date(1990, index % 12, (index % 28) + 1),
          gender: [Gender.male, Gender.female, Gender.other][index % 3],
          phone: `+94770000${(index + 1).toString().padStart(3, '0')}`,
          address: `Address line ${index + 1}`,
          bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][index % 8],
          isActive: true,
        },
      }),
    ),
  );

  await prisma.patientAllergy.createMany({
    data: Array.from({ length: 10 }).map((_, index) => ({
      patientId: patients[index % patients.length].id,
      allergyName: `Allergy ${index + 1}`,
      severity: [AllergySeverity.low, AllergySeverity.moderate, AllergySeverity.high][index % 3],
    })),
  });

  const appointments = await Promise.all(
    Array.from({ length: 12 }).map((_, index) =>
      prisma.appointment.create({
        data: {
          patientId: patients[index % patients.length].id,
          doctorId: doctors[index % doctors.length].id,
          assistantId: assistants[index % assistants.length].id,
          scheduledAt: new Date(Date.now() + index * 60 * 60 * 1000),
          status: [
            AppointmentStatus.waiting,
            AppointmentStatus.in_consultation,
            AppointmentStatus.completed,
            AppointmentStatus.cancelled,
          ][index % 4],
          reason: `Visit reason ${index + 1}`,
          priority: [PriorityLevel.normal, PriorityLevel.urgent, PriorityLevel.critical][index % 3],
        },
      }),
    ),
  );

  const encounters = await Promise.all(
    Array.from({ length: 10 }).map((_, index) =>
      prisma.encounter.create({
        data: {
          appointmentId: appointments[index].id,
          patientId: appointments[index].patientId,
          doctorId: appointments[index].doctorId!,
          notes: `Encounter notes ${index + 1}`,
          nextVisitDate: new Date(Date.now() + (index + 7) * 24 * 60 * 60 * 1000),
        },
      }),
    ),
  );

  await prisma.encounterDiagnosis.createMany({
    data: Array.from({ length: 10 }).map((_, index) => ({
      encounterId: encounters[index].id,
      icd10Code: `J20.${index}`,
      diagnosisName: `Diagnosis ${index + 1}`,
    })),
  });

  await prisma.testOrder.createMany({
    data: Array.from({ length: 10 }).map((_, index) => ({
      encounterId: encounters[index].id,
      testName: `Test ${index + 1}`,
      status: [TestOrderStatus.ordered, TestOrderStatus.completed, TestOrderStatus.cancelled][index % 3],
    })),
  });

  const prescriptions = await Promise.all(
    Array.from({ length: 10 }).map((_, index) =>
      prisma.prescription.create({
        data: {
          encounterId: encounters[index].id,
          patientId: encounters[index].patientId,
          doctorId: encounters[index].doctorId,
        },
      }),
    ),
  );

  await prisma.prescriptionItem.createMany({
    data: Array.from({ length: 10 }).map((_, index) => ({
      prescriptionId: prescriptions[index].id,
      drugName: `Medicine ${index + 1}`,
      dose: '500MG',
      frequency: 'TDS',
      duration: `${(index % 7) + 3} days`,
      quantity: (index % 5) + 1,
      source: index % 2 === 0 ? DrugSource.Clinical : DrugSource.Outside,
    })),
  });

  const inventoryItems = await Promise.all(
    Array.from({ length: 10 }).map((_, index) =>
      prisma.inventoryItem.create({
        data: {
          sku: `SKU-${(index + 1).toString().padStart(4, '0')}`,
          name: `Inventory Item ${index + 1}`,
          category: [InventoryCategory.medicine, InventoryCategory.supply, InventoryCategory.equipment][
            index % 3
          ],
          unit: ['tablet', 'ml', 'box'][index % 3],
          stock: 100 + index * 5,
          reorderLevel: 20 + index,
          isActive: true,
        },
      }),
    ),
  );

  await prisma.inventoryMovement.createMany({
    data: Array.from({ length: 10 }).map((_, index) => ({
      inventoryItemId: inventoryItems[index].id,
      movementType: [
        InventoryMovementType.in,
        InventoryMovementType.out,
        InventoryMovementType.adjustment,
      ][index % 3],
      quantity: 5 + index,
      referenceType: index % 2 === 0 ? 'prescription' : 'manual_adjust',
      referenceId: index % 2 === 0 ? prescriptions[index % prescriptions.length].id : null,
      note: `Movement note ${index + 1}`,
      createdById: assistants[index % assistants.length].id,
    })),
  });

  await prisma.auditLog.createMany({
    data: Array.from({ length: 10 }).map((_, index) => ({
      actorUserId: users[index % users.length].id,
      entityType: ['patient', 'appointment', 'encounter', 'prescription', 'inventory'][index % 5],
      entityId: BigInt(index + 1),
      action: ['created', 'updated', 'viewed'][index % 3],
      ip: '127.0.0.1',
      userAgent: 'seed-script',
      payload: { seed: true, sequence: index + 1 },
      requestId: randomUUID(),
    })),
  });

  console.log('Seed completed with 10+ rows across all tables.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
