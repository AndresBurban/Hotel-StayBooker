import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';

import { CrearUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  register(dto: CrearUsuarioDto) {
    return this.usuariosService.registrar(dto);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarPorEmailConPassword(
      dto.email,
    );

    if (
      !usuario ||
      !usuario.activo ||
      !(await bcrypt.compare(dto.password, usuario.password))
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      roles: usuario.roles.map((rol) => rol.nombre),
    });

    const { password, ...usuarioSeguro } = usuario;
    return { access_token: accessToken, usuario: usuarioSeguro };
  }
}
