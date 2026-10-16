import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habitacione, EstadoHabitacion } from './entities/habitacione.entity';
import { CreateHabitacioneDto } from './dto/create-habitacione.dto';
import { UpdateHabitacioneDto } from './dto/update-habitacione.dto';
import { ChangeEstadoHabitacionDto } from './dto/change-estado-habitacion.dto';

@Injectable()
export class HabitacionesService {
  constructor(
    @InjectRepository(Habitacione)
    private readonly habitacionesRepository: Repository<Habitacione>,
  ) {}

  async create(dto: CreateHabitacioneDto) {
    const existente = await this.habitacionesRepository.findOne({
      where: { numero: dto.numero },
    });
    if (existente) {
      throw new ConflictException('El número de habitación ya está registrado');
    }

    return this.habitacionesRepository.save(
      this.habitacionesRepository.create({
        ...dto,
        estado: dto.estado ?? EstadoHabitacion.DISPONIBLE,
      }),
    );
  }

  findAll() {
    return this.habitacionesRepository.find({ order: { numero: 'ASC' } });
  }

  async findOne(id: number) {
    const habitacion = await this.habitacionesRepository.findOne({
      where: { id },
    });
    if (!habitacion) {
      throw new NotFoundException('Habitación no encontrada');
    }
    return habitacion;
  }

  async update(id: number, dto: UpdateHabitacioneDto) {
    const habitacion = await this.findOne(id);
    if (dto.numero !== undefined && dto.numero !== habitacion.numero) {
      const existente = await this.habitacionesRepository.findOne({
        where: { numero: dto.numero },
      });
      if (existente) {
        throw new ConflictException('El número de habitación ya está registrado');
      }
    }
    Object.assign(habitacion, dto);
    return this.habitacionesRepository.save(habitacion);
  }

  async cambiarEstado(id: number, dto: ChangeEstadoHabitacionDto) {
    const habitacion = await this.findOne(id);
    habitacion.estado = dto.estado;
    return this.habitacionesRepository.save(habitacion);
  }
}
