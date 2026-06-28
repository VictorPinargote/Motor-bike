import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('descuentos')
export class Descuento {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  codigo?: string;

  @Column('decimal')
  porcentaje?: number;

  @Column({ type: 'date' })
  fecha_inicio?: Date;

  @Column({ type: 'date' })
  fecha_fin?: Date;

  @Column({ default: true })
  activo?: boolean;
}