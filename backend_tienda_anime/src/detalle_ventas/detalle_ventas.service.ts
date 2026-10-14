import { Injectable, NotFoundException } from "@nestjs/common";
import { DetalleVenta } from "./entities/detalle_venta.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateDetalleVentaDto } from "./dto/create-detalle_venta.dto";
import { UpdateDetalleVentaDto } from "./dto/update-detalle_venta.dto";

@Injectable()
export class DetalleVentasService {
  constructor(
    @InjectRepository(DetalleVenta)
    private detalleVentasRepository: Repository<DetalleVenta>,
  ) {}

  async create(createDetalleVentaDto: CreateDetalleVentaDto): Promise<DetalleVenta> {
    // Para el detalle de venta, a veces se puede validar si ya existe el mismo producto en la misma venta, 
    // pero si se permite, simplemente creamos y guardamos usando el patrón establecido:
    let detalleVenta = this.detalleVentasRepository.create(createDetalleVentaDto);
    return this.detalleVentasRepository.save(detalleVenta);
  }

  async findAll(): Promise<DetalleVenta[]> {
    return this.detalleVentasRepository.find()
  }

  async findOne(id: number): Promise<DetalleVenta> {
    const detalleVenta = await this.detalleVentasRepository.findOneBy({ id });
    if (!detalleVenta) throw new NotFoundException('El detalle de venta no existe');
    return detalleVenta;
  }

  async update(id: number, updateDetalleVentaDto: UpdateDetalleVentaDto): Promise<DetalleVenta> {
    const detalleVenta = await this.findOne(id);
    Object.assign(detalleVenta, updateDetalleVentaDto);
    return this.detalleVentasRepository.save(detalleVenta);
  }

  async remove(id: number): Promise<DetalleVenta> {
    const detalleVenta = await this.findOne(id);
    return this.detalleVentasRepository.remove(detalleVenta);
  }
}