import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NombreRol } from '../../roles/entities/role.entity';

export class AsignarRolDto {
  @ApiProperty({ enum: NombreRol, isArray: true, example: [NombreRol.ADMIN] })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(NombreRol, { each: true })
  roles: NombreRol[];
}
