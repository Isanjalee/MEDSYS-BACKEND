import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../infra/prisma/prisma.service';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const payload = { sub: user.id.toString(), role: user.role, email: user.email };
    const accessTtlSeconds = 15 * 60;
    const refreshTtlSeconds = 7 * 24 * 60 * 60;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessTtlSeconds,
    });

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, jti: randomUUID() },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtlSeconds,
      },
    );

    const refreshHash = this.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + refreshTtlSeconds * 1000);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokenPair(user);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      const tokenHash = this.hashRefreshToken(refreshToken);
      const existing = await this.prisma.refreshToken.findFirst({
        where: {
          tokenHash,
          userId: BigInt(decoded.sub),
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
      if (!existing) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      await this.prisma.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date() },
      });

      const user = await this.prisma.user.findUnique({ where: { id: BigInt(decoded.sub) } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid user');
      }
      return this.issueTokenPair(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<{ success: true }> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }
}
