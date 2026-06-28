import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Mantenimiento } from './mantenimiento.entity';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@Injectable()
export class MantenimientosService {
  constructor(
    @InjectRepository(Mantenimiento)
    private readonly repository: Repository<Mantenimiento>,
  ) {}

  async create(dto: CreateMantenimientoDto): Promise<Mantenimiento | null> {
    try {
      const mantenimiento = this.repository.create(dto);
      return await this.repository.save(mantenimiento);
    } catch (err) {
      console.error('Error creating mantenimiento:', err);
      return null;
    }
  }

  async findAll(queryDto: QueryDto): Promise<Pagination<Mantenimiento> | null> {
    try {
      const { page, limit, search, searchField, sort, order } = queryDto;

      const query = this.repository.createQueryBuilder('mantenimiento');

      if (search) {
        if (searchField) {
          switch (searchField) {
            case 'moto_id':
              query.where('mantenimiento.moto_id ILIKE :search', {
                search: `%${search}%`,
              });
              break;
            case 'usuario_id':
              query.where('mantenimiento.usuario_id ILIKE :search', {
                search: `%${search}%`,
              });
              break;
            case 'descripcion':
              query.where('mantenimiento.descripcion ILIKE :search', {
                search: `%${search}%`,
              });
              break;
            default:
              query.where(
                '(mantenimiento.moto_id ILIKE :search OR mantenimiento.usuario_id ILIKE :search OR mantenimiento.descripcion ILIKE :search)',
                { search: `%${search}%` },
              );
          }
        } else {
          query.where(
            '(mantenimiento.moto_id ILIKE :search OR mantenimiento.usuario_id ILIKE :search OR mantenimiento.descripcion ILIKE :search)',
            { search: `%${search}%` },
          );
        }
      }

      if (sort) {
        const validFields = ['moto_id', 'usuario_id', 'fecha', 'descripcion', 'costo'];
        const sortField = validFields.includes(sort) ? sort : 'fecha';
        const sortOrder = order === 'ASC' || order === 'DESC' ? order : 'ASC';
        query.orderBy(`mantenimiento.${sortField}`, sortOrder);
      }

      return await paginate<Mantenimiento>(query, { page, limit });
    } catch (err) {
      console.error('Error fetching mantenimientos:', err);
      return null;
    }
  }

  async findOne(id: string): Promise<Mantenimiento | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(
    id: string,
    dto: UpdateMantenimientoDto,
  ): Promise<Mantenimiento | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    Object.assign(entity, dto);
    return await this.repository.save(entity);
  }

  async remove(id: string): Promise<Mantenimiento | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    return await this.repository.remove(entity);
  }
}
