import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoHabitacion } from '../entities/habitacione.entity';

export class ChangeEstadoHabitacionDto {
  @ApiProperty({ enum: EstadoHabitacion })
  @IsEnum(EstadoHabitacion)
  estado: EstadoHabitacion;
}
