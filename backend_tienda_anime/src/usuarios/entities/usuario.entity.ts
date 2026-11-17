import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Venta } from '../../ventas/entities/venta.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  usuario: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  clave: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'nombre_completo',
    nullable: false,
  })
  @Expose({ name: 'nombre_completo' })
  nombreCompleto: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  rol: string; // 'ADMINISTRADOR' o 'VENDEDOR'

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas: Venta[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.clave) {
      const salt = await bcrypt.genSalt(10);
      this.clave = await bcrypt.hash(this.clave, salt);
    }
  }
}