import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { NotFoundException } from '@nestjs/common';
import { Producto } from '../productos/entities/producto.entity';
import { DetalleVenta } from '../detalle_ventas/entities/detalle_venta.entity';

describe('VentasService', () => {
  let service: VentasService;
  const dataSource = {
    transaction: jest.fn(),
  };
  const ventasRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        { provide: getRepositoryToken(Venta), useValue: ventasRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('limits a vendor sales query to the authenticated user', async () => {
    ventasRepository.find.mockResolvedValue([]);

    await service.findAll(42, 'VENDEDOR');

    expect(ventasRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { usuarioId: 42 } }),
    );
  });

  it('does not return another vendor sale by id', async () => {
    ventasRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(12, 42, 'VENDEDOR')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(ventasRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 12, usuarioId: 42 } }),
    );
  });

  it('allows administrators to query sales without an owner filter', async () => {
    ventasRepository.find.mockResolvedValue([]);

    await service.findAll(42, 'ADMINISTRADOR');

    expect(ventasRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('limits customer history to sales linked to the authenticated customer', async () => {
    ventasRepository.find.mockResolvedValue([]);

    await service.findAll(19, 'CLIENTE');

    expect(ventasRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clienteId: 19 } }),
    );
  });

  it('reserves stock when creating a customer order and stores it as pending', async () => {
    const producto = {
      id: 5,
      nombre: 'Figura',
      precioVenta: '12.50',
      stock: 4,
      estado: true,
    };
    const productoRepository = {
      findOne: jest.fn().mockResolvedValue(producto),
      save: jest.fn().mockImplementation((value) => value),
    };
    const ventaRepository = {
      create: jest.fn((value) => value),
      save: jest.fn().mockImplementation(async (value) => ({ ...value, id: 8 })),
      findOneOrFail: jest.fn().mockResolvedValue({ id: 8, estado: 'PENDIENTE' }),
    };
    const detalleRepository = {
      create: jest.fn((value) => value),
      save: jest.fn().mockResolvedValue([]),
    };
    const repositories = new Map<Function, object>([
      [Producto, productoRepository],
      [Venta, ventaRepository],
      [DetalleVenta, detalleRepository],
    ]);
    const manager = {
      getRepository: jest.fn((entity: Function) => {
        const repository = repositories.get(entity);
        if (!repository) throw new Error('Unexpected repository');
        return repository;
      }),
    };
    dataSource.transaction.mockImplementation((callback) => callback(manager));

    await service.createPedido(
      { items: [{ productoId: 5, cantidad: 2 }] },
      19,
    );

    expect(producto.stock).toBe(2);
    expect(productoRepository.save).toHaveBeenCalledWith(producto);
    expect(ventaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clienteId: 19,
        usuarioId: null,
        estado: 'PENDIENTE',
        total: 25,
      }),
    );
  });

  it('restores reserved stock when a pending customer order is rejected', async () => {
    const producto = { id: 5, stock: 2 };
    const pedido = {
      id: 8,
      estado: 'PENDIENTE',
      clienteId: 19,
      usuarioId: null,
      detalles: [{ productoId: 5, cantidad: 3 }],
    };
    const productoRepository = {
      findOne: jest.fn().mockResolvedValue(producto),
      save: jest.fn().mockImplementation((value) => value),
    };
    const detalleRepository = {
      findBy: jest.fn().mockResolvedValue(pedido.detalles),
    };
    const ventaRepository = {
      findOne: jest.fn().mockResolvedValue(pedido),
      save: jest.fn().mockImplementation((value) => value),
      findOneOrFail: jest
        .fn()
        .mockResolvedValue({ ...pedido, estado: 'RECHAZADO' }),
    };
    const repositories = new Map<Function, object>([
      [Venta, ventaRepository],
      [Producto, productoRepository],
      [DetalleVenta, detalleRepository],
    ]);
    const manager = {
      getRepository: jest.fn((entity: Function) => {
        const repository = repositories.get(entity);
        if (!repository) throw new Error('Unexpected repository');
        return repository;
      }),
    };
    dataSource.transaction.mockImplementation((callback) => callback(manager));

    await service.updateEstado(8, { estado: 'RECHAZADO' });

    expect(producto.stock).toBe(5);
    expect(productoRepository.save).toHaveBeenCalledWith(producto);
    expect(ventaRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'RECHAZADO' }),
    );
  });
});
