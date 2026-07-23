import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from './carrito.entity';
import { CreateCarritoDto } from './dto/create-carrito.dto';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito)
    private readonly repository: Repository<Carrito>,
  ) {}

  async create(dto: CreateCarritoDto): Promise<Carrito> {
    const existing = await this.repository.findOne({
      where: { usuario_id: dto.usuario_id, moto_id: dto.moto_id },
    });
    if (existing) return existing;

    const item = this.repository.create(dto);
    return await this.repository.save(item);
  }

  async findByUser(usuario_id: string): Promise<Carrito[]> {
    return await this.repository.find({
      where: { usuario_id },
      order: { fecha_agregado: 'DESC' },
    });
  }

  async remove(id: string): Promise<Carrito | null> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) return null;
    return await this.repository.remove(item);
  }

  async removeByMotoAndUser(usuario_id: string, moto_id: string): Promise<Carrito | null> {
    const item = await this.repository.findOne({ where: { usuario_id, moto_id } });
    if (!item) return null;
    return await this.repository.remove(item);
  }

  async clearUserCart(usuario_id: string): Promise<void> {
    await this.repository.delete({ usuario_id });
  }
}
