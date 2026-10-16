
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from './entities/usuario.entity';
import { CrearUsuarioDto } from './dto/create-usuario.dto';
import { ActualizarUsuarioDto } from './dto/update-usuario.dto';
import { AsignarRolDto } from './dto/assign-role.dto';
import { Rol, NombreRol } from '../roles/entities/role.entity';

@Injectable()
export class UsuariosService {
  async remove(id: number) {
    const resultado = await this.usuariosRepository.delete(id);

    if (resultado.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return resultado;
  }

  findOne(id: number) {
    return this.buscarPorId(id);
  }

  findAll() {
    return this.listar();
  }

  create(crearUsuarioDto: CrearUsuarioDto) {
    return this.crear(crearUsuarioDto, [NombreRol.CLIENTE]);
  }

  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolesRepository: Repository<Rol>,
  ) {}

  async registrar(dto: CrearUsuarioDto) {
    return this.crear(dto, [NombreRol.CLIENTE]);
  }

  async crear(dto: CrearUsuarioDto, nombresRoles: NombreRol[] = [NombreRol.CLIENTE]) {
    const existente = await this.usuariosRepository.findOne({
      where: { email: dto.email },
    });

    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const roles = await this.obtenerOCrearRoles(nombresRoles);

    const usuario = this.usuariosRepository.create({
      nombre: dto.nombre,
      email: dto.email,
      password: passwordHash,
      roles,
    });

    const guardado = await this.usuariosRepository.save(usuario);

    const { password, ...resultado } = guardado;
    return resultado;
  }

  async asignarRoles(id: number, dto: AsignarRolDto) {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.roles = await this.obtenerOCrearRoles(dto.roles);
    const actualizado = await this.usuariosRepository.save(usuario);
    const { password, ...resultado } = actualizado;
    return resultado;
  }

  private async obtenerOCrearRoles(nombres: NombreRol[]): Promise<Rol[]> {
    const roles: Rol[] = [];
    for (const nombre of nombres) {
      let rol = await this.rolesRepository.findOne({ where: { nombre } });
      if (!rol) {
        rol = await this.rolesRepository.save(
          this.rolesRepository.create({ nombre }),
        );
      }
      roles.push(rol);
    }
    return roles;
  }

  async listar() {
    const usuarios = await this.usuariosRepository.find();

    return usuarios.map(({ password, ...usuario }) => usuario);
  }

  async buscarPorId(id: number) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...resultado } = usuario;
    return resultado;
  }

  buscarPorEmailConPassword(email: string) {
    return this.usuariosRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .leftJoinAndSelect('usuario.roles', 'rol')
      .where('usuario.email = :email', { email })
      .getOne();
  }

  async actualizar(id: number, dto: ActualizarUsuarioDto) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.email && dto.email !== usuario.email) {
      const existente = await this.usuariosRepository.findOne({
        where: { email: dto.email },
      });

      if (existente) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    Object.assign(usuario, dto);

    const actualizado = await this.usuariosRepository.save(usuario);

    const { password, ...resultado } = actualizado;
    return resultado;
  }
}
