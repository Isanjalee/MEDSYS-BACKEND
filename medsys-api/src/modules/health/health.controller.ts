import { Controller, Get } from '@nestjs/common';
import { Public } from '../../shared/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  health(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @Public()
  ready(): { status: string; timestamp: string } {
    return { status: 'ready', timestamp: new Date().toISOString() };
  }
}
