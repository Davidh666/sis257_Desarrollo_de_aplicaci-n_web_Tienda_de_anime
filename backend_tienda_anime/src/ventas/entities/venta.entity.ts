import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetalleVenta } from '../../detalle_ventas/entities/detalle_venta.entity';

export type VentaEstado =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'COMPLETADA'
  | 'ANULADA';

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

  @Column({ type: 'int', name: 'cliente_id', nullable: true })
  clienteId: number | null;

  @Column({ type: 'int', name: 'usuario_id', nullable: true })
  usuarioId: number | null;

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: VentaEstado;

  @ManyToOne(() => Usuario, (usuario) => usuario.ventasComoCliente, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Usuario | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.ventas, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @OneToMany(() => DetalleVenta, (detalleVenta) => detalleVenta.venta, {
    cascade: true,
  })
  detalles: DetalleVenta[];
}