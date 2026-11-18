import { ClassSerializerInterceptor, Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { DetalleVentasService } from './detalle_ventas.service';
import { CreateDetalleVentaDto } from './dto/create-detalle_venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle_venta.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Detalles de venta')
@ApiBearerAuth('access-token')
@Controller('detalle-ventas')
@UseInterceptors(ClassSerializerInterceptor)
@Roles('ADMINISTRADOR')
export class DetalleVentasController {
  constructor(private readonly detalleVentasService: DetalleVentasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un detalle de venta (solo administrador)' })
  @ApiResponse({ status: 201, description: 'Detalle creado.' })
  @ApiResponse({ status: 403, description: 'Rol sin permisos.' })
  create(@Body() createDetalleVentaDto: CreateDetalleVentaDto) {
    return this.detalleVentasService.create(createDetalleVentaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar detalles de venta (solo administrador)' })
  @ApiResponse({ status: 200, description: 'Lista de detalles.' })
  findAll() {
    return this.detalleVentasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un detalle por ID (solo administrador)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle encontrado.' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.detalleVentasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un detalle (solo administrador)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle actualizado.' })
  update(@Param('id') id: string, @Body() updateDetalleVentaDto: UpdateDetalleVentaDto) {
    return this.detalleVentasService.update(+id, updateDetalleVentaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un detalle (solo administrador)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle eliminado.' })
  remove(@Param('id') id: string) {
    return this.detalleVentasService.remove(+id);
  }
}
