import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from '../roles/entities/role.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { RolesGuard } from '../common/guards/roles.guard';
import { InitialAdminSeeder } from './initial-admin-seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol])],
  controllers: [UsuariosController],
  providers: [UsuariosService, RolesGuard, InitialAdminSeeder],
  exports: [TypeOrmModule, UsuariosService],
})
export class UsuariosModule {}
