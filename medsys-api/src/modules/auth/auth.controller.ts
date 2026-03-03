import { Body, Controller, Post, Req } from '@nestjs/common';
import type { RequestWithContext } from '../../shared/types/request-context';
import { Public } from '../../shared/decorators/public.decorator';
import { AuditService } from '../audit/audit.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Post('login')
  @Public()
  async login(@Body() body: LoginDto, @Req() req: RequestWithContext): Promise<unknown> {
    const result = await this.authService.login(body.email, body.password);
    await this.auditService.log({
      action: 'login_success',
      entityType: 'auth',
      requestId: req.requestId!,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      payload: { email: body.email },
    });
    return result;
  }

  @Post('refresh')
  @Public()
  async refresh(@Body() body: RefreshDto): Promise<unknown> {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  async logout(@Body() body: LogoutDto): Promise<unknown> {
    return this.authService.logout(body.refreshToken);
  }
}
