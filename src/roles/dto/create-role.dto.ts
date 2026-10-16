import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { NombreRol } from '../entities/role.entity';

export class CreateRoleDto {
	@ApiProperty({ enum: NombreRol })
	@IsEnum(NombreRol)
	nombre: NombreRol;
}
