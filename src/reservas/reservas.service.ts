import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Habitacione, EstadoHabitacion } from '../habitaciones/entities/habitacione.entity';
import { NombreRol } from '../roles/entities/role.entity';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { EstadoReserva, Reserva } from './entities/reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateReservaDto, actor: AuthUser) {
    const fechaInicio = dto.fechaInicio.slice(0, 10);
    const fechaFin = dto.fechaFin.slice(0, 10);
    const hoy = new Date().toISOString().slice(0, 10);

    if (fechaInicio >= fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }
    if (fechaInicio < hoy) {
      throw new BadRequestException('No se permiten reservas en fechas pasadas');
    }

    const esRecepcionista = actor.roles.includes(NombreRol.RECEPCIONISTA);
    const clienteId = esRecepcionista ? dto.clienteId : actor.id;
    if (!clienteId) {
      throw new BadRequestException(
        'La recepción debe indicar el ID del cliente',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const habitaciones = manager.getRepository(Habitacione);
      const reservas = manager.getRepository(Reserva);
      const usuarios = manager.getRepository(Usuario);

      // El bloqueo serializa las solicitudes concurrentes para la misma habitación.
      const habitacion = await habitaciones.findOne({
        where: { id: dto.habitacionId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!habitacion) {
        throw new NotFoundException('Habitación no encontrada');
      }
      if (habitacion.estado === EstadoHabitacion.MANTENIMIENTO) {
        throw new ConflictException('La habitación está en mantenimiento');
      }

      const solapada = await reservas
        .createQueryBuilder('reserva')
        .innerJoin('reserva.habitacion', 'habitacion')
        .where('habitacion.id = :habitacionId', {
          habitacionId: habitacion.id,
        })
        .andWhere('reserva.estado = :estado', {
          estado: EstadoReserva.ACTIVA,
        })
        .andWhere('reserva.fechaInicio < :fechaFin', { fechaFin })
        .andWhere('reserva.fechaFin > :fechaInicio', { fechaInicio })
        .getOne();
      if (solapada) {
        throw new ConflictException(
          'La habitación ya tiene una reserva activa en ese rango de fechas',
        );
      }

      const cliente = await usuarios.findOne({ where: { id: clienteId } });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }

      const reserva = reservas.create({
        fechaInicio,
        fechaFin,
        estado: EstadoReserva.ACTIVA,
        cliente,
        habitacion,
      });
      const guardada = await reservas.save(reserva);
      await this.actualizarEstadoHabitacion(
        habitacion,
        reservas,
        habitaciones,
      );
      return guardada;
    });
  }

  findAll(actor: AuthUser) {
    const query = this.reservasRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.cliente', 'cliente')
      .leftJoinAndSelect('reserva.habitacion', 'habitacion')
      .orderBy('reserva.fechaInicio', 'ASC');

    if (
      actor.roles.includes(NombreRol.CLIENTE) &&
      !actor.roles.includes(NombreRol.ADMIN) &&
      !actor.roles.includes(NombreRol.RECEPCIONISTA)
    ) {
      query.where('cliente.id = :clienteId', { clienteId: actor.id });
    }
    return query.getMany();
  }

  async findOne(id: number, actor: AuthUser) {
    const reserva = await this.reservasRepository.findOne({
      where: { id },
      relations: { cliente: true, habitacion: true },
    });
    if (
      !reserva ||
      (actor.roles.includes(NombreRol.CLIENTE) &&
        !actor.roles.includes(NombreRol.ADMIN) &&
        !actor.roles.includes(NombreRol.RECEPCIONISTA) &&
        reserva.cliente.id !== actor.id)
    ) {
      throw new NotFoundException('Reserva no encontrada');
    }
    return reserva;
  }

  async cancelar(id: number, actor: AuthUser) {
    return this.cambiarEstado(id, EstadoReserva.CANCELADA, actor);
  }

  async finalizar(id: number) {
    return this.cambiarEstado(id, EstadoReserva.FINALIZADA);
  }

  private async cambiarEstado(
    id: number,
    estado: EstadoReserva,
    actor?: AuthUser,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const reservas = manager.getRepository(Reserva);
      const habitaciones = manager.getRepository(Habitacione);
      const reserva = await reservas.findOne({
        where: { id },
        relations: { cliente: true, habitacion: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }
      if (
        estado === EstadoReserva.CANCELADA &&
        actor?.roles.includes(NombreRol.CLIENTE) &&
        !actor.roles.includes(NombreRol.ADMIN) &&
        !actor.roles.includes(NombreRol.RECEPCIONISTA) &&
        reserva.cliente.id !== actor.id
      ) {
        throw new ForbiddenException('No puedes cancelar la reserva de otro cliente');
      }
      if (reserva.estado !== EstadoReserva.ACTIVA) {
        throw new ConflictException('Solo se pueden cambiar reservas activas');
      }

      reserva.estado = estado;
      const actualizada = await reservas.save(reserva);
      const habitacion = await habitaciones.findOne({
        where: { id: reserva.habitacion.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (habitacion) {
        await this.actualizarEstadoHabitacion(
          habitacion,
          reservas,
          habitaciones,
        );
      }
      return actualizada;
    });
  }

  private async actualizarEstadoHabitacion(
    habitacion: Habitacione,
    reservasRepository: Repository<Reserva>,
    habitacionesRepository: Repository<Habitacione>,
  ) {
    if (habitacion.estado === EstadoHabitacion.MANTENIMIENTO) {
      return;
    }
    const hoy = new Date().toISOString().slice(0, 10);
    const ocupada = await reservasRepository
      .createQueryBuilder('reserva')
      .innerJoin('reserva.habitacion', 'habitacion')
      .where('habitacion.id = :habitacionId', { habitacionId: habitacion.id })
      .andWhere('reserva.estado = :estado', { estado: EstadoReserva.ACTIVA })
      .andWhere('reserva.fechaInicio <= :hoy', { hoy })
      .andWhere('reserva.fechaFin > :hoy', { hoy })
      .getOne();

    habitacion.estado = ocupada
      ? EstadoHabitacion.OCUPADA
      : EstadoHabitacion.DISPONIBLE;
    await habitacionesRepository.save(habitacion);
  }
}
