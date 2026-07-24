import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('garantias')
export class Garantia {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  moto_id?: number;

  @Column()
  duracion_meses?: number;

  @Column({ type: 'text' })
  descripcion?: string;

  @CreateDateColumn()
  fecha_inicio?: Date;
}