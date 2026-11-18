import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { RegisterUsuarioDto } from './dto/register-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/auth-public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('usuarios')
@UseInterceptors(ClassSerializerInterceptor)
@Roles('ADMINISTRADOR')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Public()
  @Roles()
  @ApiOperation({ summary: 'Registrar una cuenta de cliente' })
  @ApiResponse({ status: 201, description: 'Cuenta creada como cliente.' })
  @ApiResponse({ status: 409, description: 'El nombre de usuario ya existe.' })
  register(@Body() registerUsuarioDto: RegisterUsuarioDto) {
    const createUsuarioDto: CreateUsuarioDto = {
      usuario: registerUsuarioDto.usuario,
      clave: registerUsuarioDto.clave,
      nombreCompleto: registerUsuarioDto.nombreCompleto,
      rol: 'CLIENTE',
      estado: true,
    };
    return this.usuariosService.create(createUsuarioDto, 'CLIENTE');
  }

  @Post('administradores')
  @ApiBearerAuth('access-token')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear una cuenta de administrador' })
  @ApiResponse({ status: 201, description: 'Cuenta creada sin exponer su clave.' })
  @ApiResponse({ status: 403, description: 'Rol sin permisos.' })
  createAdministrator(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create({
      usuario: createUsuarioDto.usuario,
      clave: createUsuarioDto.clave,
      nombreCompleto: createUsuarioDto.nombreCompleto,
      rol: 'ADMINISTRADOR',
      estado: createUsuarioDto.estado,
    }, 'ADMINISTRADOR');
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar usuarios (solo administrador)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios.' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Consultar un usuario por ID (solo administrador)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un usuario (solo administrador)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario actualizado.' })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un usuario (solo administrador)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario eliminado.' })
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}