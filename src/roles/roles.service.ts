import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolesRepository: Repository<Rol>,
  ) {}

  async create(dto: CreateRoleDto) {
    const existente = await this.rolesRepository.findOne({
      where: { nombre: dto.nombre },
    });
    if (existente) {
      throw new ConflictException('El rol ya existe');
    }
    return this.rolesRepository.save(this.rolesRepository.create(dto));
  }

  findAll() {
    return this.rolesRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const rol = await this.rolesRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    return rol;
  }

  async update(id: number, dto: UpdateRoleDto) {
    const rol = await this.findOne(id);
    if (dto.nombre && dto.nombre !== rol.nombre) {
      const existente = await this.rolesRepository.findOne({
        where: { nombre: dto.nombre },
      });
      if (existente) {
        throw new ConflictException('El rol ya existe');
      }
    }
    Object.assign(rol, dto);
    return this.rolesRepository.save(rol);
  }

  async remove(id: number) {
    const rol = await this.rolesRepository.findOne({
      where: { id },
      relations: { usuarios: true },
    });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    if (rol.usuarios.length > 0) {
      throw new ConflictException('No se puede eliminar un rol asignado');
    }
    await this.rolesRepository.remove(rol);
    return { deleted: true };
  }
}
