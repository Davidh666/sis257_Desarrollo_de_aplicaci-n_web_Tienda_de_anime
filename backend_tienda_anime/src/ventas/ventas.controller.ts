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
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { UpdateVentaEstadoDto } from './dto/update-venta-estado.dto';
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
  @Roles('ADMINISTRADOR', 'VENDEDOR', 'CLIENTE')
  @ApiOperation({
    summary: 'Listar ventas; los vendedores solo ven las propias',
  })
  @ApiResponse({ status: 200, description: 'Lista de ventas.' })
  findAll(@Req() request: AuthenticatedRequest) {
    return this.ventasService.findAll(request.user.id, request.user.rol);
  }

  @Post('pedidos')
  @Roles('CLIENTE')
  @ApiOperation({
    summary: 'Crear un pedido pendiente como cliente autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado y stock reservado.',
  })
  @ApiResponse({ status: 400, description: 'Stock insuficiente.' })
  @ApiResponse({ status: 404, description: 'Producto no disponible.' })
  createPedido(
    @Body() createPedidoDto: CreatePedidoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ventasService.createPedido(createPedidoDto, request.user.id);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'VENDEDOR', 'CLIENTE')
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

  @Patch(':id/estado')
  @Roles('ADMINISTRADOR', 'VENDEDOR')
  @ApiOperation({
    summary: 'Aprobar o rechazar un pedido pendiente',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Estado del pedido actualizado.' })
  @ApiResponse({
    status: 409,
    description: 'El pedido ya fue resuelto.',
  })
  updateEstado(
    @Param('id') id: string,
    @Body() updateVentaEstadoDto: UpdateVentaEstadoDto,
  ) {
    return this.ventasService.updateEstado(
      Number(id),
      updateVentaEstadoDto,
    );
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
