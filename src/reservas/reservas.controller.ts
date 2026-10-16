import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { NombreRol } from '../roles/entities/role.entity';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthenticatedRequest {
  user: AuthUser;
}

@Controller('reservas')
@ApiTags('Reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @Roles(NombreRol.CLIENTE, NombreRol.RECEPCIONISTA)
  create(
    @Body() createReservaDto: CreateReservaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reservasService.create(createReservaDto, request.user);
  }

  @Get()
  @Roles(NombreRol.ADMIN, NombreRol.RECEPCIONISTA, NombreRol.CLIENTE)
  findAll(@Req() request: AuthenticatedRequest) {
    return this.reservasService.findAll(request.user);
  }

  @Get(':id')
  @Roles(NombreRol.ADMIN, NombreRol.RECEPCIONISTA, NombreRol.CLIENTE)
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.reservasService.findOne(+id, request.user);
  }

  @Patch(':id/cancelar')
  @Roles(NombreRol.CLIENTE, NombreRol.ADMIN)
  cancel(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.reservasService.cancelar(+id, request.user);
  }

  @Patch(':id/finalizar')
  @Roles(NombreRol.RECEPCIONISTA)
  finish(@Param('id') id: string) {
    return this.reservasService.finalizar(+id);
  }
}
