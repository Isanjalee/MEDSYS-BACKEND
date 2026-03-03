import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class PatientAllergyInputDto {
  @ApiProperty({ example: 'Penicillin' })
  @IsString()
  @MaxLength(120)
  allergy_name!: string;
}

export class CreatePatientDto {
  @ApiPropertyOptional({ example: '199012345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nic?: string;

  @ApiProperty({ example: 'Nimal Perera' })
  @IsString()
  @MaxLength(180)
  full_name!: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.male })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '+94770000001' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'No 10, Main Street, Colombo' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  blood_group?: string;

  @ApiPropertyOptional({
    type: [PatientAllergyInputDto],
    example: [{ allergy_name: 'Penicillin' }],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PatientAllergyInputDto)
  allergies?: PatientAllergyInputDto[];
}
