import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mantenimientos')
export class Mantenimiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  moto_id: string;

  @Column()
  usuario_id: string;

  @Column()
  fecha: Date;

  @Column()
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  costo: number;
}
