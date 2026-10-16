import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservaDto {
	@ApiProperty({ example: '2026-11-10', format: 'date' })
	@IsDateString({ strict: true })
	fechaInicio: string;

	@ApiProperty({ example: '2026-11-15', format: 'date' })
	@IsDateString({ strict: true })
	fechaFin: string;

	@ApiProperty({ example: 101, minimum: 1 })
	@Type(() => Number)
	@IsInt()
	@Min(1)
	habitacionId: number;

	@ApiPropertyOptional({ example: 12, description: 'Obligatorio para RECEPCIONISTA; el CLIENTE usa su propio ID.' })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	clienteId?: number;
}
