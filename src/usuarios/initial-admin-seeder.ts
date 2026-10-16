import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NombreRol } from '../roles/entities/role.entity';
import { UsuariosService } from './usuarios.service';

@Injectable()
export class InitialAdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(InitialAdminSeeder.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const nombre = this.configService.get<string>('INITIAL_ADMIN_NAME');
    const email = this.configService.get<string>('INITIAL_ADMIN_EMAIL');
    const password = this.configService.get<string>('INITIAL_ADMIN_PASSWORD');

    if (!nombre || !email || !password) {
      return;
    }

    const existing = await this.usuariosService.buscarPorEmailConPassword(email);
    if (existing) {
      return;
    }

    await this.usuariosService.crear(
      { nombre, email, password },
      [NombreRol.ADMIN],
    );
    this.logger.log(`Administrador inicial creado para ${email}`);
  }
}
