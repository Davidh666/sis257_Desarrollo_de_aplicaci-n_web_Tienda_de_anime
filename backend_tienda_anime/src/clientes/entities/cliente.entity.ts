import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity ('Clientes')
export class Cliente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'razon_social', type: 'varchar', length: 100, nullable: false })
    razonSocial: string;

    @Column({ name: 'nit_ci', type: 'varchar', length: 20, unique: true, nullable: false })
    nitCi: string;

    @Column({ type: 'varchar', length: 15, nullable: true })
    telefono: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email: string;

    @Column({ type: 'boolean', default: true })
    estado: boolean;

    @CreateDateColumn({ name: 'fecha_creacion'})
    fechaCreacion: Date;
    
    @CreateDateColumn({ name: 'fecha_modificacion'})
    
    fechaModificacion: Date;
    
    @CreateDateColumn({ name: 'fecha_eliminacion'})
    
    fechaEliminacion: Date;



}
