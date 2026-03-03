import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@Roles(UserRole.owner)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query() query: PaginationDto): Promise<unknown> {
    return this.usersService.list(query);
  }

  @Post()
  create(@Body() body: CreateUserDto): Promise<unknown> {
    return this.usersService.create(body);
  }
}
