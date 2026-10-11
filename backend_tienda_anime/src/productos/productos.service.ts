import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    // Validar si el código del producto ya existe
    const productoExistente = await this.productosRepository.findOneBy({
      codigo: createProductoDto.codigo,
    });
    if (productoExistente) throw new ConflictException('El código del producto ya existe');

    // Validar que la categoría exista
    const categoria = await this.categoriasRepository.findOneBy({
      id: createProductoDto.categoria_id,
    });
    if (!categoria) throw new NotFoundException('La categoría especificada no existe');

    const producto = this.productosRepository.create(createProductoDto);
    return this.productosRepository.save(producto);
  }

  async findAll(): Promise<Producto[]> {
    return this.productosRepository.find();
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOneBy({ id });
    if (!producto) throw new NotFoundException('El Producto no existe');
    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);

    // Si se intenta cambiar la categoría, verificar que exista
    if (updateProductoDto.categoria_id) {
      const categoria = await this.categoriasRepository.findOneBy({
        id: updateProductoDto.categoria_id,
      });
      if (!categoria) throw new NotFoundException('La categoría especificada no existe');
    }

    Object.assign(producto, updateProductoDto);
    return this.productosRepository.save(producto);
  }

  async remove(id: number): Promise<Producto> {
    const producto = await this.findOne(id);
    return this.productosRepository.remove(producto);
  }
}