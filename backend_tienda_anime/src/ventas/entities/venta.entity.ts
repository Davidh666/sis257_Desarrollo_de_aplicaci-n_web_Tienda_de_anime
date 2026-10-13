import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cliente } from "../../clientes/entities/cliente.entity";
import { Usuario } from "../../usuarios/entities/usuario.entity";
import { DetalleVenta } from "../../detalle_ventas/entities/detalle_venta.entity";

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  correlativo: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  total: number;

  @Column({ type: 'int', name: 'cliente_id', nullable: false })
  cliente_id: number;

  @Column({ type: 'int', name: 'usuario_id', nullable: false })
  usuario_id: number;

  @Column({ type: 'varchar', length: 20, default: 'COMPLETADA' })
  estado: string; // 'COMPLETADA' o 'ANULADA'

  // Relación con Clientes (Unidireccional simple)
  @ManyToOne(() => Cliente, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  // Relación con Usuarios
  @ManyToOne(() => Usuario, (usuario) => usuario.ventas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => DetalleVenta, (detalleVenta) => detalleVenta.venta, { cascade: true })
detalles: DetalleVenta[];
}