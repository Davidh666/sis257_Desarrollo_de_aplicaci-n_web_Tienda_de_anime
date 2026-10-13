import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    // Validar si ya existe una venta con el mismo número de correlativo
    let venta = await this.ventasRepository.findOneBy({
      correlativo: createVentaDto.correlativo,
    });
    if (venta) {
      throw new ConflictException('Ya existe una venta con este número de correlativo');
    }

    venta = this.ventasRepository.create(createVentaDto);
    return this.ventasRepository.save(venta);
  }

  async findAll(): Promise<Venta[]> {
    return this.ventasRepository.find();
     
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventasRepository.findOneBy({ id })
    if (!venta) throw new NotFoundException('La venta no existe');
    return venta;
    }
    

  async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    const venta = await this.findOne(id);
    Object.assign(venta, updateVentaDto);
    return this.ventasRepository.save(venta);
  }

  async remove(id: number): Promise<Venta> {
    const venta = await this.findOne(id);
    return this.ventasRepository.remove(venta);
  }
}