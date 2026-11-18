import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Usuario } from '../usuarios/entities/usuario.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

type AuthenticatedRequest = Request & { user: Usuario };

@ApiTags('Ventas')
@ApiBearerAuth('access-token')
@Controller('ventas')
@UseInterceptors(ClassSerializerInterceptor)
@Roles('ADMINISTRADOR', 'VENDEDOR')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una venta usando precios y stock del servidor',
  })
  @ApiResponse({ status: 201, description: 'Venta y detalles registrados.' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente o solicitud inválida.' })
  @ApiResponse({ status: 404, description: 'Cliente o producto no disponible.' })
  create(
    @Body() createVentaDto: CreateVentaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ventasService.create(createVentaDto, request.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar ventas; los vendedores solo ven las propias',
  })
  @ApiResponse({ status: 200, description: 'Lista de ventas.' })
  findAll(@Req() request: AuthenticatedRequest) {
    return this.ventasService.findAll(request.user.id, request.user.rol);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar una venta; los vendedores solo acceden a las propias',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Venta encontrada.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.ventasService.findOne(
      Number(id),
      request.user.id,
      request.user.rol,
    );
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar el estado de una venta (administrador)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Venta actualizada.' })
  @ApiResponse({ status: 403, description: 'Rol sin permisos.' })
  update(@Param('id') id: string, @Body() updateVentaDto: UpdateVentaDto) {
    return this.ventasService.update(Number(id), updateVentaDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar una venta (administrador)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Venta eliminada.' })
  @ApiResponse({ status: 403, description: 'Rol sin permisos.' })
  remove(@Param('id') id: string) {
    return this.ventasService.remove(Number(id));
  }
}
