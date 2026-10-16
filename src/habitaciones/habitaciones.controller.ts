import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HabitacionesService } from './habitaciones.service';
import { CreateHabitacioneDto } from './dto/create-habitacione.dto';
import { UpdateHabitacioneDto } from './dto/update-habitacione.dto';
import { ChangeEstadoHabitacionDto } from './dto/change-estado-habitacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { NombreRol } from '../roles/entities/role.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('habitaciones')
@ApiTags('Habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.ADMIN)
  create(@Body() createHabitacioneDto: CreateHabitacioneDto) {
    return this.habitacionesService.create(createHabitacioneDto);
  }

  @Get()
  findAll() {
    return this.habitacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.habitacionesService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateHabitacioneDto: UpdateHabitacioneDto,
  ) {
    return this.habitacionesService.update(+id, updateHabitacioneDto);
  }

  @Patch(':id/estado')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.ADMIN, NombreRol.RECEPCIONISTA)
  changeState(
    @Param('id') id: string,
    @Body() dto: ChangeEstadoHabitacionDto,
  ) {
    return this.habitacionesService.cambiarEstado(+id, dto);
  }
}
