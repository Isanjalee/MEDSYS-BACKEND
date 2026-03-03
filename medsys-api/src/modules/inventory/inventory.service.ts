import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryMovementType } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { toSkipTake } from '../../shared/utils/pagination';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto): Promise<unknown> {
    const { skip, take } = toSkipTake(query.page, query.limit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventoryItem.findMany({
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.inventoryItem.count(),
    ]);
    return { data, meta: { page: query.page, limit: query.limit, total } };
  }

  async createItem(dto: CreateInventoryItemDto): Promise<unknown> {
    return this.prisma.inventoryItem.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        category: dto.category,
        unit: dto.unit,
        stock: dto.stock,
        reorderLevel: dto.reorder_level,
      },
    });
  }

  async createMovement(
    inventoryId: bigint,
    dto: CreateInventoryMovementDto,
    createdById: bigint,
  ): Promise<unknown> {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: inventoryId } });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const currentStock = Number(item.stock);
    const delta =
      dto.movement_type === InventoryMovementType.in
        ? dto.quantity
        : dto.movement_type === InventoryMovementType.out
          ? -dto.quantity
          : 0;
    const nextStock =
      dto.movement_type === InventoryMovementType.adjustment ? dto.quantity : currentStock + delta;

    if (nextStock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventoryId,
          movementType: dto.movement_type,
          quantity: dto.quantity,
          referenceType: dto.reference_type,
          referenceId: dto.reference_id ? BigInt(dto.reference_id) : undefined,
          note: dto.note,
          createdById,
        },
      });

      await tx.inventoryItem.update({
        where: { id: inventoryId },
        data: { stock: nextStock },
      });

      return movement;
    });
  }
}
