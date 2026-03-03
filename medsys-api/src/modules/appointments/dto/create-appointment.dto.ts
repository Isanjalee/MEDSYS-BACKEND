import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus, PriorityLevel } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  patient_id!: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  doctor_id?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assistant_id?: number;

  @ApiProperty({ example: '2026-03-10T09:30:00.000Z' })
  @IsDateString()
  scheduled_at!: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, example: AppointmentStatus.waiting })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ example: 'Fever and cough for 2 days' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ enum: PriorityLevel, example: PriorityLevel.normal })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;
}
