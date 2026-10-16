import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Habitacione } from '../habitaciones/entities/habitacione.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Habitacione, Usuario])],
  controllers: [ReservasController],
  providers: [ReservasService, RolesGuard],
  exports: [ReservasService],
})
export class ReservasModule {}
