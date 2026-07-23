import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Reserva } from './reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { QueryDto } from 'src/common/dto/query.dto';
import { Carrito } from '../carrito/carrito.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly repository: Repository<Reserva>,
    @InjectRepository(Carrito)
    private readonly carritoRepository: Repository<Carrito>,
  ) {}

  async create(dto: CreateReservaDto): Promise<Reserva | null> {
    try {
      const reserva = this.repository.create(dto);
      const saved = await this.repository.save(reserva);
      if (saved && saved.estado === 'confirmada') {
        const existing = await this.carritoRepository.findOne({
          where: { usuario_id: saved.usuario_id, moto_id: saved.moto_id },
        });
        if (!existing) {
          const item = this.carritoRepository.create({
            usuario_id: saved.usuario_id,
            moto_id: saved.moto_id,
          });
          await this.carritoRepository.save(item);
        }
      }
      return saved;
    } catch (err) {
      console.error('Error creating reserva:', err);
      return null;
    }
  }

  async findAll(queryDto: QueryDto): Promise<Pagination<Reserva> | null> {
    try {
      const { page, limit, search, searchField, sort, order } = queryDto;

      const query = this.repository.createQueryBuilder('reserva');

      if (search) {
        if (searchField) {
          switch (searchField) {
            case 'usuario_id':
              query.where('reserva.usuario_id ILIKE :search', {
                search: `%${search}%`,
              });
              break;
            case 'moto_id':
              query.where('reserva.moto_id ILIKE :search', {
                search: `%${search}%`,
              });
              break;
            case 'estado':
              query.where('reserva.estado ILIKE :search', {
                search: `%${search}%`,
              });
              break;
            default:
              query.where(
                '(reserva.usuario_id ILIKE :search OR reserva.moto_id ILIKE :search OR reserva.estado ILIKE :search)',
                { search: `%${search}%` },
              );
          }
        } else {
          query.where(
            '(reserva.usuario_id ILIKE :search OR reserva.moto_id ILIKE :search OR reserva.estado ILIKE :search)',
            { search: `%${search}%` },
          );
        }
      }

      if (sort) {
        const validFields = ['usuario_id', 'moto_id', 'fecha_reserva', 'estado'];
        const sortField = validFields.includes(sort) ? sort : 'fecha_reserva';
        const sortOrder = order === 'ASC' || order === 'DESC' ? order : 'ASC';
        query.orderBy(`reserva.${sortField}`, sortOrder);
      }

      return await paginate<Reserva>(query, { page, limit });
    } catch (err) {
      console.error('Error fetching reservas:', err);
      return null;
    }
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateReservaDto) {
    const entity = await this.findOne(id);
    if (!entity) return null;
    Object.assign(entity, dto);
    const updated = await this.repository.save(entity);

    if (updated && updated.estado === 'confirmada') {
      const existing = await this.carritoRepository.findOne({
        where: { usuario_id: updated.usuario_id, moto_id: updated.moto_id },
      });
      if (!existing) {
        const item = this.carritoRepository.create({
          usuario_id: updated.usuario_id,
          moto_id: updated.moto_id,
        });
        await this.carritoRepository.save(item);
      }
    } else if (updated && (updated.estado === 'cancelada' || updated.estado === 'pendiente')) {
      await this.carritoRepository.delete({
        usuario_id: updated.usuario_id,
        moto_id: updated.moto_id,
      });
    }
    return updated;
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    if (!entity) return null;
    return this.repository.remove(entity);
  }
}
