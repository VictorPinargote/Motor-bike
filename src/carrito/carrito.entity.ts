import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('carrito')
export class Carrito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuario_id: string;

  @Column()
  moto_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_agregado: Date;
}
