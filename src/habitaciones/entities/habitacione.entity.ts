import {
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Reserva } from '../../reservas/entities/reserva.entity';

export enum TipoHabitacion {
	INDIVIDUAL = 'individual',
	DOBLE = 'doble',
	SUITE = 'suite',
}

export enum EstadoHabitacion {
	DISPONIBLE = 'disponible',
	OCUPADA = 'ocupada',
	MANTENIMIENTO = 'mantenimiento',
}

@Entity('habitaciones')
export class Habitacione {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int', unique: true })
	numero: number;

	@Column({ type: 'enum', enum: TipoHabitacion })
	tipo: TipoHabitacion;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	precioPorNoche: number;

	@Column({
		type: 'enum',
		enum: EstadoHabitacion,
		default: EstadoHabitacion.DISPONIBLE,
	})
	estado: EstadoHabitacion;

	@OneToMany(() => Reserva, (reserva) => reserva.habitacion)
	reservas: Reserva[];
}
