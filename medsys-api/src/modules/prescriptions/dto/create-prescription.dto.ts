import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DrugSource } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class PrescriptionItemInputDto {
  @ApiProperty({ example: 'Amoxicillin' })
  @IsString()
  @MaxLength(180)
  drug_name!: string;

  @ApiPropertyOptional({ example: '500MG' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  dose?: string;

  @ApiPropertyOptional({ example: 'TDS' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  frequency?: string;

  @ApiPropertyOptional({ example: '5 days' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  duration?: string;

  @ApiProperty({ example: 15 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantity!: number;

  @ApiProperty({ enum: DrugSource, example: DrugSource.Clinical })
  @IsEnum(DrugSource)
  source!: DrugSource;
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  encounter_id!: number;

  @ApiProperty({ example: 21 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  patient_id!: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  doctor_id!: number;

  @ApiProperty({
    type: [PrescriptionItemInputDto],
    example: [
      {
        drug_name: 'Amoxicillin',
        dose: '500MG',
        frequency: 'TDS',
        duration: '5 days',
        quantity: 15,
        source: 'Clinical',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemInputDto)
  items!: PrescriptionItemInputDto[];
}
