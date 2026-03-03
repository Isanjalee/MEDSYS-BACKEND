import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryMovementType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateInventoryMovementDto {
  @ApiProperty({ enum: InventoryMovementType, example: InventoryMovementType.out })
  @IsEnum(InventoryMovementType)
  movement_type!: InventoryMovementType;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantity!: number;

  @ApiPropertyOptional({ example: 'prescription' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  reference_type?: string;

  @ApiPropertyOptional({ example: 123 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  reference_id?: number;

  @ApiPropertyOptional({ example: 'Dispensed from assistant panel' })
  @IsOptional()
  @IsString()
  note?: string;
}
