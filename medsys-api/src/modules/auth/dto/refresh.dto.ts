import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ example: 'paste_refresh_token_here' })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
