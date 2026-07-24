import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Pago } from './pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly repository: Repository<Pago>,
  ) {}

  async create(dto: CreatePagoDto): Promise<Pago | null> {
    try {
      const pago = this.repository.create(dto);
      return await this.repository.save(pago);
    } catch (err) {
      console.error('Error creating pago:', err);
      return null;
    }
  }

  async findAll(queryDto: QueryDto): Promise<Pagination<Pago> | null> {
    try {
      const { page, limit, search, searchField, sort, order } = queryDto;
      const query = this.repository.createQueryBuilder('pago');

      if (search) {
        if (searchField === 'metodo_pago') {
          query.where('pago.metodo_pago ILIKE :search', { search: `%${search}%` });
        } else {
          query.where('pago.metodo_pago ILIKE :search', { search: `%${search}%` });
        }
      }

      if (sort) {
        const allowed = ['monto', 'fecha_pago', 'metodo_pago'];
        const sortField = allowed.includes(sort) ? sort : 'fecha_pago';
        const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';
        query.orderBy(`pago.${sortField}`, sortOrder);
      }

      return await paginate<Pago>(query, { page, limit });
    } catch (err) {
      console.error('Error fetching pagos:', err);
      return null;
    }
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdatePagoDto) {
    const entity = await this.findOne(id);
    if (!entity) return null;
    Object.assign(entity, dto);
    return this.repository.save(entity);
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    if (!entity) return null;
    return this.repository.remove(entity);
  }
}
