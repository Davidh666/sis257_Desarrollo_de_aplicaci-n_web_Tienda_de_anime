import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Producto } from "../../productos/entities/producto.entity";



@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];

  @CreateDateColumn({ name: 'fecha_creacion'})
  fechaCreacion: Date;

  @CreateDateColumn({ name: 'fecha_modificacion'})

  fechaModificacion: Date;

  @CreateDateColumn({ name: 'fecha_eliminacion'})

  fechaEliminacion: Date;
}