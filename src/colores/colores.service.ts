import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Color } from './color.entity';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@Injectable()
export class ColoresService {
  constructor(
    @InjectRepository(Color)
    private readonly repository: Repository<Color>,
  ) {}

  async create(dto: CreateColorDto): Promise<Color | null> {
    try {
      const color = this.repository.create(dto);
      return await this.repository.save(color);
    } catch (err) {
      console.error('Error creating color:', err);
      return null;
    }
  }

  async findAll(queryDto: QueryDto): Promise<Pagination<Color> | null> {
    try {
      const { page, limit, search, searchField, sort, order } = queryDto;

      const query = this.repository.createQueryBuilder('color');

      if (search) {
        if (searchField === 'nombre') {
          query.where('color.nombre ILIKE :search', { search: `%${search}%` });
        } else if (searchField === 'codigo_hex') {
          query.where('color.codigo_hex ILIKE :search', { search: `%${search}%` });
        } else {
          query.where(
            '(color.nombre ILIKE :search OR color.codigo_hex ILIKE :search OR color.descripcion ILIKE :search)',
            { search: `%${search}%` },
          );
        }
      }

      if (sort) {
        const allowed = ['nombre', 'codigo_hex'];
        const sortField = allowed.includes(sort) ? sort : 'nombre';
        const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';
        query.orderBy(`color.${sortField}`, sortOrder);
      }

      return await paginate<Color>(query, { page, limit });
    } catch (err) {
      console.error('Error fetching colores:', err);
      return null;
    }
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateColorDto) {
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
