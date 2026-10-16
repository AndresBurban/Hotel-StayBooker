import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habitacione } from './entities/habitacione.entity';
import { HabitacionesService } from './habitaciones.service';
import { HabitacionesController } from './habitaciones.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Habitacione])],
  controllers: [HabitacionesController],
  providers: [HabitacionesService, RolesGuard],
  exports: [HabitacionesService],
})
export class HabitacionesModule {}
