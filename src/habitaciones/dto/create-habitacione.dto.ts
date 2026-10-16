import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	EstadoHabitacion,
	TipoHabitacion,
} from '../entities/habitacione.entity';

export class CreateHabitacioneDto {
  @ApiProperty({ example: 101, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numero: number;

  @ApiProperty({ enum: TipoHabitacion, example: TipoHabitacion.INDIVIDUAL })
  @IsEnum(TipoHabitacion)
  tipo: TipoHabitacion;

  @ApiProperty({ example: 99.99, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  precioPorNoche: number;

  @ApiPropertyOptional({ enum: EstadoHabitacion })
  @IsOptional()
  @IsEnum(EstadoHabitacion)
  estado?: EstadoHabitacion;
}
