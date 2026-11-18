import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Venta } from '../../ventas/entities/venta.entity';
import type { UserRole } from '../../auth/interfaces/user-role.interface';
import { isBcryptHash } from '../utils/password.util';

@Entity('usuarios')
@Index('UQ_usuarios_nit_ci', ['nitCi'], { unique: true })
export class Usuario {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  usuario: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  @Exclude()
  clave: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'nombre_completo',
    nullable: false,
  })
  nombreCompleto: string;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'CLIENTE' })
  rol: UserRole;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'nit_ci',
    nullable: true,
  })
  nitCi: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas: Venta[];

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventasComoCliente: Venta[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.clave && !isBcryptHash(this.clave)) {
      const salt = await bcrypt.genSalt(10);
      this.clave = await bcrypt.hash(this.clave, salt);
    }
  }
}