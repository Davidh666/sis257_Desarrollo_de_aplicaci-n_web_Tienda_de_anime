import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Producto } from "../../productos/entities/producto.entity";
import { Venta } from "../../ventas/entities/venta.entity";

@Entity('detalle_ventas')
export class DetalleVenta {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', name: 'venta_id', nullable: false })
  venta_id: number;

  @Column({ type: 'int', name: 'producto_id', nullable: false })
  producto_id: number;

  @Column({ type: 'int', nullable: false })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, name: 'precio_unitario' })
  precio_unitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  subtotal: number;

  // Relación con Venta (Si se borra la venta, se borran sus detalles automáticamente por el CASCADE)
// Por esto (sin la función inversa):
    @ManyToOne(() => Venta, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venta_id' })
    venta: Venta;


}
