import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AddDiagnosisDto {
  @ApiPropertyOptional({ example: 'J20.9' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  icd10_code?: string;

  @ApiProperty({ example: 'Acute bronchitis, unspecified' })
  @IsString()
  @MaxLength(255)
  diagnosis_name!: string;
}
