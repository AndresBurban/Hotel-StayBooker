import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Habitacione } from '../../habitaciones/entities/habitacione.entity';

export enum EstadoReserva {
	ACTIVA = 'activa',
	CANCELADA = 'cancelada',
	FINALIZADA = 'finalizada',
}

@Entity('reservas')
export class Reserva {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'date' })
	fechaInicio: string;

	@Column({ type: 'date' })
	fechaFin: string;

	@Column({
		type: 'enum',
		enum: EstadoReserva,
		default: EstadoReserva.ACTIVA,
	})
	estado: EstadoReserva;

	@ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
	@JoinColumn({ name: 'usuario_id' })
	cliente: Usuario;

	@ManyToOne(() => Habitacione, (habitacion) => habitacion.reservas, {
		nullable: false,
		onDelete: 'RESTRICT',
	})
	@JoinColumn({ name: 'habitacion_id' })
	habitacion: Habitacione;

	@CreateDateColumn()
	creadoEn: Date;
}
