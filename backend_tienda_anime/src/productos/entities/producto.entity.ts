import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Categoria } from "../../categorias/entities/categoria.entity";



@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true, nullable: false })
  codigo: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'precio_venta', type: 'decimal', precision: 10, scale: 2, nullable: false })
  precioVenta: number;

  @Column({ type: 'int', default: 0, nullable: false })
  stock: number;

  @Column({ name: 'imagen_url', type: 'varchar', length: 255, nullable: true })
  imagenUrl: string;

  @Column({ name: 'categoria_id', nullable: false })
  categoriaId: number;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;
}