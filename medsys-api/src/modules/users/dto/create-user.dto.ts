import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'doctor.new@medsys.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Dr. Jane Perera' })
  @IsString()
  @MaxLength(150)
  full_name!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.doctor })
  @IsEnum(UserRole)
  role!: UserRole;
}
