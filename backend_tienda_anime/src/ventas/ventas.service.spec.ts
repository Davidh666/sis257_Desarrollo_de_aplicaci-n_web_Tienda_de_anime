import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { NotFoundException } from '@nestjs/common';

describe('VentasService', () => {
  let service: VentasService;
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
        { provide: DataSource, useValue: {} },
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
});
