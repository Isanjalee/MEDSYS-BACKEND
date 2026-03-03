import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { toSkipTake } from '../../shared/utils/pagination';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto): Promise<unknown> {
    const { skip, take } = toSkipTake(query.page, query.limit);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          uuid: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data, meta: { page: query.page, limit: query.limit, total } };
  }

  async create(dto: CreateUserDto): Promise<unknown> {
    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.user.create({
      data: {
        uuid: randomUUID(),
        email: dto.email,
        passwordHash,
        fullName: dto.full_name,
        role: dto.role,
      },
      select: {
        id: true,
        uuid: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}
