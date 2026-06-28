import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Venta } from './venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly repository: Repository<Venta>,
  ) {}

  async create(dto: CreateVentaDto): Promise<Venta | null> {
    try {
      const venta = this.repository.create({ ...dto, fecha_venta: new Date() });
      return await this.repository.save(venta);
    } catch (err) {
      console.error('Error creating venta:', err);
      return null;
    }
  }

  async findAll(queryDto: QueryDto): Promise<Pagination<Venta> | null> {
    try {
      const { page, limit, search, searchField, sort, order } = queryDto;

      const query = this.repository.createQueryBuilder('venta');

      if (search) {
        if (searchField) {
          switch (searchField) {
            case 'usuario_id':
              query.where('venta.usuario_id ILIKE :search', {
                search: `%${search}%`,
              });
              break;
            case 'moto_id':
              query.where('venta.moto_id ILIKE :search', {
                search: `%${search}%`,
              });
              break;
            case 'estado':
              query.where('venta.estado ILIKE :search', {
                search: `%${search}%`,
              });
              break;
            default:
              query.where(
                '(venta.usuario_id ILIKE :search OR venta.moto_id ILIKE :search OR venta.estado ILIKE :search)',
                { search: `%${search}%` },
              );
          }
        } else {
          query.where(
            '(venta.usuario_id ILIKE :search OR venta.moto_id ILIKE :search OR venta.estado ILIKE :search)',
            { search: `%${search}%` },
          );
        }
      }

      if (sort) {
        const validFields = ['usuario_id', 'moto_id', 'fecha_venta', 'precio_venta', 'estado'];
        const sortField = validFields.includes(sort) ? sort : 'fecha_venta';
        const sortOrder = order === 'ASC' || order === 'DESC' ? order : 'ASC';
        query.orderBy(`venta.${sortField}`, sortOrder);
      }

      return await paginate<Venta>(query, { page, limit });
    } catch (err) {
      console.error('Error fetching ventas:', err);
      return null;
    }
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateVentaDto) {
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
