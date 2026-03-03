import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: 'paste_refresh_token_here' })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
