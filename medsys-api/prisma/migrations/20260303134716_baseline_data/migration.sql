-- Enable extension required by CITEXT columns
CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('owner', 'doctor', 'assistant');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('waiting', 'in_consultation', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "priority_level" AS ENUM ('normal', 'urgent', 'critical');

-- CreateEnum
CREATE TYPE "allergy_severity" AS ENUM ('low', 'moderate', 'high');

-- CreateEnum
CREATE TYPE "drug_source" AS ENUM ('Clinical', 'Outside');

-- CreateEnum
CREATE TYPE "inventory_category" AS ENUM ('medicine', 'supply', 'equipment');

-- CreateEnum
CREATE TYPE "inventory_movement_type" AS ENUM ('in', 'out', 'adjustment');

-- CreateEnum
CREATE TYPE "test_order_status" AS ENUM ('ordered', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "role" "user_role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "nic" VARCHAR(20),
    "full_name" VARCHAR(180) NOT NULL,
    "dob" DATE,
    "gender" "gender",
    "phone" VARCHAR(30),
    "address" TEXT,
    "blood_group" VARCHAR(5),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_allergies" (
    "id" BIGSERIAL NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "allergy_name" VARCHAR(120) NOT NULL,
    "severity" "allergy_severity",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" BIGSERIAL NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "doctor_id" BIGINT,
    "assistant_id" BIGINT,
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "appointment_status" NOT NULL DEFAULT 'waiting',
    "reason" TEXT,
    "priority" "priority_level" NOT NULL DEFAULT 'normal',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounters" (
    "id" BIGSERIAL NOT NULL,
    "appointment_id" BIGINT NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "notes" TEXT,
    "next_visit_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encounters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_diagnoses" (
    "id" BIGSERIAL NOT NULL,
    "encounter_id" BIGINT NOT NULL,
    "icd10_code" VARCHAR(16),
    "diagnosis_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "encounter_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_orders" (
    "id" BIGSERIAL NOT NULL,
    "encounter_id" BIGINT NOT NULL,
    "test_name" VARCHAR(180) NOT NULL,
    "status" "test_order_status" NOT NULL DEFAULT 'ordered',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" BIGSERIAL NOT NULL,
    "encounter_id" BIGINT NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" BIGSERIAL NOT NULL,
    "prescription_id" BIGINT NOT NULL,
    "drug_name" VARCHAR(180) NOT NULL,
    "dose" VARCHAR(60),
    "frequency" VARCHAR(80),
    "duration" VARCHAR(80),
    "quantity" DECIMAL(12,2) NOT NULL,
    "source" "drug_source" NOT NULL,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" BIGSERIAL NOT NULL,
    "sku" VARCHAR(80),
    "name" VARCHAR(180) NOT NULL,
    "category" "inventory_category" NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "stock" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "reorder_level" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" BIGSERIAL NOT NULL,
    "inventory_item_id" BIGINT NOT NULL,
    "movement_type" "inventory_movement_type" NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "reference_type" VARCHAR(30),
    "reference_id" BIGINT,
    "note" TEXT,
    "created_by_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "actor_user_id" BIGINT,
    "entity_type" VARCHAR(60) NOT NULL,
    "entity_id" BIGINT,
    "action" VARCHAR(30) NOT NULL,
    "ip" INET,
    "user_agent" TEXT,
    "payload" JSONB,
    "request_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "ix_users_role_is_active" ON "users"("role", "is_active");

-- CreateIndex
CREATE INDEX "ix_refresh_tokens_user_expires" ON "refresh_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "patients_uuid_key" ON "patients"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nic_key" ON "patients"("nic");

-- CreateIndex
CREATE INDEX "ix_patients_full_name" ON "patients"("full_name");

-- CreateIndex
CREATE INDEX "ix_patient_allergies_patient" ON "patient_allergies"("patient_id");

-- CreateIndex
CREATE INDEX "ix_appointments_status_scheduled_at" ON "appointments"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "ix_appointments_patient_id" ON "appointments"("patient_id");

-- CreateIndex
CREATE INDEX "ix_appointments_doctor_scheduled_at" ON "appointments"("doctor_id", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "encounters_appointment_id_key" ON "encounters"("appointment_id");

-- CreateIndex
CREATE INDEX "ix_encounters_patient_created_at" ON "encounters"("patient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ix_encounter_diagnoses_encounter" ON "encounter_diagnoses"("encounter_id");

-- CreateIndex
CREATE INDEX "ix_encounter_diagnoses_icd10" ON "encounter_diagnoses"("icd10_code");

-- CreateIndex
CREATE INDEX "ix_test_orders_encounter" ON "test_orders"("encounter_id");

-- CreateIndex
CREATE INDEX "ix_prescriptions_patient_created_at" ON "prescriptions"("patient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ix_prescriptions_encounter_id" ON "prescriptions"("encounter_id");

-- CreateIndex
CREATE INDEX "ix_prescription_items_prescription" ON "prescription_items"("prescription_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_sku_key" ON "inventory_items"("sku");

-- CreateIndex
CREATE INDEX "ix_inventory_items_name" ON "inventory_items"("name");

-- CreateIndex
CREATE INDEX "ix_inventory_items_stock_reorder" ON "inventory_items"("stock", "reorder_level");

-- CreateIndex
CREATE INDEX "ix_inventory_movements_item_created_at" ON "inventory_movements"("inventory_item_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ix_audit_logs_created_at" ON "audit_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "ix_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_diagnoses" ADD CONSTRAINT "encounter_diagnoses_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_orders" ADD CONSTRAINT "test_orders_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
