import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import type { RequestWithContext } from '../../shared/types/request-context';
import { AuditService } from '../audit/audit.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  list(@Query() query: PaginationDto): Promise<unknown> {
    return this.inventoryService.list(query);
  }

  @Post()
  @Roles(UserRole.owner, UserRole.assistant)
  async createItem(
    @Body() body: CreateInventoryItemDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const created = await this.inventoryService.createItem(body);
    await this.auditService.log({
      actorUserId: user?.sub ? BigInt(user.sub) : undefined,
      action: 'created',
      entityType: 'inventory_item',
      entityId: BigInt((created as { id: bigint }).id.toString()),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return created;
  }

  @Post(':id/movements')
  @Roles(UserRole.owner, UserRole.assistant)
  async createMovement(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateInventoryMovementDto,
    @Req() req: RequestWithContext,
    @CurrentUser() user: RequestWithContext['user'],
  ): Promise<unknown> {
    const created = await this.inventoryService.createMovement(BigInt(id), body, BigInt(user!.sub));
    await this.auditService.log({
      actorUserId: BigInt(user!.sub),
      action: 'created',
      entityType: 'inventory_movement',
      entityId: BigInt((created as { id: bigint }).id.toString()),
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return created;
  }
}
