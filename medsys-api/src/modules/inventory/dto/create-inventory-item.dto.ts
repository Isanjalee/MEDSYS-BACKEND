import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @ApiPropertyOptional({ example: 'SKU-0001' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sku?: string;

  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiProperty({ enum: InventoryCategory, example: InventoryCategory.medicine })
  @IsEnum(InventoryCategory)
  category!: InventoryCategory;

  @ApiProperty({ example: 'tablet' })
  @IsString()
  @MaxLength(20)
  unit!: string;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  reorder_level?: number;
}
