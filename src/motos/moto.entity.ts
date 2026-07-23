import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Marca } from '../marcas/marca.entity';
import { Categoria } from '../categories/categories.entity';
import { TipoMotor } from '../tipo-motor/tipo-motor.entity';
import { EstadoMoto } from '../estado-moto/estado-moto.entity';

@Entity('motos')
export class Moto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  modelo: string;

  @Column({ nullable: true })
  marca_id: string;

  @ManyToOne(() => Marca, { nullable: true })
  @JoinColumn({ name: 'marca_id' })
  marca?: Marca;

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

  @ManyToOne(() => Categoria, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria?: Categoria;

  @Column({ nullable: true })
  tipo_motor_id: string;

  @ManyToOne(() => TipoMotor, { nullable: true })
  @JoinColumn({ name: 'tipo_motor_id' })
  tipoMotor?: TipoMotor;

  @Column({ nullable: true })
  estado_id: string;

  @ManyToOne(() => EstadoMoto, { nullable: true })
  @JoinColumn({ name: 'estado_id' })
  estado?: EstadoMoto;

  @Column({ nullable: true })
  color_id: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  imagen_url: string;

  marca_nombre?: string;
  categoria_nombre?: string;
  tipo_motor_nombre?: string;
  estado_nombre?: string;
}
