import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/create-usuario.dto';
import { ActualizarUsuarioDto } from './dto/update-usuario.dto';
import { AsignarRolDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { NombreRol } from '../roles/entities/role.entity';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthenticatedRequest {
  user: AuthUser;
}

@Controller('usuarios')
@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(NombreRol.ADMIN)
  create(@Body() createUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles(NombreRol.ADMIN)
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get('perfil')
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.usuariosService.findOne(request.user.id);
  }

  @Patch(':id/roles')
  @Roles(NombreRol.ADMIN)
  assignRoles(
    @Param('id') id: string,
    @Body() assignRoleDto: AsignarRolDto,
  ) {
    return this.usuariosService.asignarRoles(+id, assignRoleDto);
  }

  @Patch(':id')
  @Roles(NombreRol.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: ActualizarUsuarioDto,
  ) {
    return this.usuariosService.actualizar(+id, updateUsuarioDto);
  }

  @Get(':id')
  @Roles(NombreRol.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Delete(':id')
  @Roles(NombreRol.ADMIN)
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
