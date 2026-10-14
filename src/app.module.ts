import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ConfigModule } from './config/config.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { HabitacionesModule } from './habitaciones/habitaciones.module';
import { ReservasModule } from './reservas/reservas.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [UsuariosModule, ConfigModule, RolesModule, AuthModule, HabitacionesModule, ReservasModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
