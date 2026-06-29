import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Imagen } from './imagen.entity';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@Injectable()
export class ImagenesService {
  constructor(
    @InjectRepository(Imagen)
    private readonly repository: Repository<Imagen>,
  ) {}

  async create(dto: CreateImagenDto): Promise<Imagen | null> {
    try {
      const imagen = this.repository.create(dto);
      return await this.repository.save(imagen);
    } catch (err) {
      console.error('Error creating imagen:', err);
      return null;
    }
  }

  async findAll(queryDto: QueryDto): Promise<Pagination<Imagen> | null> {
    try {
      const { page, limit, search, sort, order } = queryDto;
      const query = this.repository.createQueryBuilder('imagen');

      if (search) {
        query.where('imagen.descripcion ILIKE :search', { search: `%${search}%` });
      }

      if (sort) {
        const allowed = ['url', 'descripcion', 'orden'];
        const sortField = allowed.includes(sort) ? sort : 'orden';
        const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';
        query.orderBy(`imagen.${sortField}`, sortOrder);
      }

      return await paginate<Imagen>(query, { page, limit });
    } catch (err) {
      console.error('Error fetching imagenes:', err);
      return null;
    }
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateImagenDto) {
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
