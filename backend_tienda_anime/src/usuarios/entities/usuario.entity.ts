import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Venta } from "../../ventas/entities/venta.entity";




@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  usuario: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  clave: string;

  @Column({ type: 'varchar', length: 100, name: 'nombre_completo', nullable: false })
  nombre_completo: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  rol: string; // 'ADMINISTRADOR' o 'VENDEDOR'

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  // Relación opcional con ventas si ya tienes creada la entidad Venta
  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas: Venta[];
}