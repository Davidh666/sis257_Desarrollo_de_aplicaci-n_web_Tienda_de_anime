import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { CreateVentaDto } from './dto/create-venta.dto';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { UpdateVentaEstadoDto } from './dto/update-venta-estado.dto';
import { Venta } from './entities/venta.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from '../productos/entities/producto.entity';
import { DetalleVenta } from '../detalle_ventas/entities/detalle_venta.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import type { UserRole } from '../auth/interfaces/user-role.interface';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
    private dataSource: DataSource,
  ) {}

  async create(
    createVentaDto: CreateVentaDto,
    usuarioId: number,
  ): Promise<Venta> {
    return this.dataSource.transaction(async (manager) => {
      const cliente = await manager.getRepository(Usuario).findOneBy({
        id: createVentaDto.clienteId,
        estado: true,
        rol: 'CLIENTE',
      });
      if (!cliente) {
        throw new NotFoundException('El cliente no existe o está inactivo');
      }

      const detalleData: Array<{
        productoId: number;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
      }> = [];

      for (const item of createVentaDto.items) {
        const producto = await manager.getRepository(Producto).findOne({
          where: { id: item.productoId, estado: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!producto) {
          throw new NotFoundException(
            `El producto ${item.productoId} no existe o está inactivo`,
          );
        }
        if (producto.stock < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el producto ${producto.nombre}`,
          );
        }

        const precioUnitario = Number(producto.precioVenta);
        const subtotal = Number((precioUnitario * item.cantidad).toFixed(2));
        detalleData.push({
          productoId: producto.id,
          cantidad: item.cantidad,
          precioUnitario,
          subtotal,
        });
        producto.stock -= item.cantidad;
        await manager.getRepository(Producto).save(producto);
      }

      const total = Number(
        detalleData.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
      );
      const ventaRepository = manager.getRepository(Venta);
      const venta = await ventaRepository.save(
        ventaRepository.create({
          correlativo: `AK-${randomBytes(8).toString('hex').toUpperCase()}`,
          clienteId: cliente.id,
          usuarioId,
          total,
          estado: 'COMPLETADA',
        }),
      );

      const detalleRepository = manager.getRepository(DetalleVenta);
      await detalleRepository.save(
        detalleData.map((item) =>
          detalleRepository.create({ ...item, ventaId: venta.id }),
        ),
      );

      return ventaRepository.findOneOrFail({
        where: { id: venta.id },
        relations: { cliente: true, detalles: { producto: true } },
      });
    });
  }

  async createPedido(
    createPedidoDto: CreatePedidoDto,
    clienteId: number,
  ): Promise<Venta> {
    return this.dataSource.transaction(async (manager) => {
      const detalleData: Array<{
        productoId: number;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
      }> = [];
      const productoRepository = manager.getRepository(Producto);

      for (const item of createPedidoDto.items) {
        const producto = await productoRepository.findOne({
          where: { id: item.productoId, estado: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!producto) {
          throw new NotFoundException(
            `El producto ${item.productoId} no existe o está inactivo`,
          );
        }
        if (producto.stock < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el producto ${producto.nombre}`,
          );
        }

        const precioUnitario = Number(producto.precioVenta);
        const subtotal = Number((precioUnitario * item.cantidad).toFixed(2));
        detalleData.push({
          productoId: producto.id,
          cantidad: item.cantidad,
          precioUnitario,
          subtotal,
        });
        producto.stock -= item.cantidad;
        await productoRepository.save(producto);
      }

      const total = Number(
        detalleData.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
      );
      const ventaRepository = manager.getRepository(Venta);
      const pedido = await ventaRepository.save(
        ventaRepository.create({
          correlativo: `AK-${randomBytes(8).toString('hex').toUpperCase()}`,
          clienteId,
          usuarioId: null,
          total,
          estado: 'PENDIENTE',
        }),
      );
      const detalleRepository = manager.getRepository(DetalleVenta);
      await detalleRepository.save(
        detalleData.map((item) =>
          detalleRepository.create({ ...item, ventaId: pedido.id }),
        ),
      );

      return ventaRepository.findOneOrFail({
        where: { id: pedido.id },
        relations: { cliente: true, detalles: { producto: true } },
      });
    });
  }

  async findAll(usuarioId: number, rol: UserRole): Promise<Venta[]> {
    return this.ventasRepository.find({
      where:
        rol === 'ADMINISTRADOR'
          ? {}
          : rol === 'VENDEDOR'
            ? { usuarioId }
            : { clienteId: usuarioId },
      relations: {
        cliente: true,
        detalles: { producto: true },
      },
      order: { fecha: 'DESC' },
    });
  }

  async findOne(
    id: number,
    usuarioId: number,
    rol: UserRole,
  ): Promise<Venta> {
    const venta = await this.ventasRepository.findOne({
      where: {
        id,
        ...(rol === 'VENDEDOR'
          ? { usuarioId }
          : rol === 'CLIENTE'
            ? { clienteId: usuarioId }
            : {}),
      },
      relations: {
        cliente: true,
        detalles: { producto: true },
      },
    });
    if (!venta) {
      throw new NotFoundException('La venta no existe');
    }

    return venta;
  }

  async updateEstado(
    id: number,
    updateVentaEstadoDto: UpdateVentaEstadoDto,
  ): Promise<Venta> {
    return this.dataSource.transaction(async (manager) => {
      const ventaRepository = manager.getRepository(Venta);
      const venta = await ventaRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!venta) {
        throw new NotFoundException('El pedido no existe');
      }
      if (venta.estado !== 'PENDIENTE') {
        throw new ConflictException('Solo se pueden resolver pedidos pendientes');
      }

      if (
        updateVentaEstadoDto.estado === 'RECHAZADO' &&
        venta.usuarioId === null &&
        venta.clienteId !== null
      ) {
        const productoRepository = manager.getRepository(Producto);
        const detalles = await manager
          .getRepository(DetalleVenta)
          .findBy({ ventaId: id });
        for (const detalle of detalles) {
          const producto = await productoRepository.findOne({
            where: { id: detalle.productoId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!producto) {
            throw new NotFoundException(
              `No se puede liberar el stock del producto ${detalle.productoId}`,
            );
          }
          producto.stock += detalle.cantidad;
          await productoRepository.save(producto);
        }
      }

      venta.estado = updateVentaEstadoDto.estado;
      await ventaRepository.save(venta);
      return ventaRepository.findOneOrFail({
        where: { id },
        relations: {
          cliente: true,
          detalles: { producto: true },
        },
      });
    });
  }

  async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    const venta = await this.ventasRepository.findOneBy({ id });
    if (!venta) throw new NotFoundException('La venta no existe');
    if (this.isCustomerOrder(venta)) {
      throw new ConflictException(
        'Los pedidos de clientes deben aprobarse o rechazarse por su endpoint de estado',
      );
    }
    Object.assign(venta, updateVentaDto);
    return this.ventasRepository.save(venta);
  }

  async remove(id: number): Promise<Venta> {
    const venta = await this.ventasRepository.findOneBy({ id });
    if (!venta) throw new NotFoundException('La venta no existe');
    if (this.isCustomerOrder(venta) && venta.estado === 'PENDIENTE') {
      throw new ConflictException(
        'Rechaza el pedido pendiente antes de eliminarlo para liberar el stock',
      );
    }
    return this.ventasRepository.remove(venta);
  }

  private isCustomerOrder(venta: Venta): boolean {
    return (
      venta.usuarioId === null &&
      venta.clienteId !== null &&
      ['PENDIENTE', 'APROBADO', 'RECHAZADO'].includes(venta.estado)
    );
  }
}