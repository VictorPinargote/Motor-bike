import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  venta_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @Column()
  fecha_pago: string;

  @Column()
  metodo_pago: string;
}
