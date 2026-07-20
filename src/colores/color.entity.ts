import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('colores')
export class Color {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  codigo_hex: string;

  @Column({ nullable: true })
  descripcion: string;
}
