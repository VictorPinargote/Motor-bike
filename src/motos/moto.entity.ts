import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('motos')
export class Moto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  modelo: string;

  @Column({ nullable: true })
  marca_id: string;

  @Column({ nullable: true })
  anio: number;

  @Column({ nullable: true })
  cilindraje: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column()
  stock: number;

  @Column({ nullable: true })
  categoria_id: string;

  @Column({ nullable: true })
  tipo_motor_id: string;

  @Column({ nullable: true })
  estado_id: string;

  @Column({ nullable: true })
  color_id: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  imagen_url: string;
}
