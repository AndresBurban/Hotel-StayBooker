
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearUsuarioDto {
  @ApiProperty({ example: 'Ana Pérez', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'ana@example.com', maxLength: 150 })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({ example: 'password-seguro', minLength: 8, maxLength: 15 })
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  password: string;
}
