import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('imagenes')
export class Imagen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  moto_id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ default: 0 })
  orden: number;
}
