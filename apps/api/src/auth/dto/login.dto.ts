import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@fertilizer.pk', description: 'Registered email address' })
  @IsEmail({}, { message: 'Durust email address darj karein' })
  email!: string;

  @ApiProperty({ example: 'AdminPass123!', description: 'Account password' })
  @IsString()
  @MinLength(6, { message: 'Password kam az kam 6 characters ka hona chahiye' })
  password!: string;
}
