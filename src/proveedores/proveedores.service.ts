import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Proveedor } from './proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly repository: Repository<Proveedor>,
  ) {}

  async create(dto: CreateProveedorDto): Promise<Proveedor | null> {
    try {
      const proveedor = this.repository.create(dto);
      return await this.repository.save(proveedor);
    } catch (err) {
      console.error('Error creating proveedor:', err);
      return null;
    }
  }

  async findAll(queryDto: QueryDto): Promise<Pagination<Proveedor> | null> {
    try {
      const { page, limit, search, searchField, sort, order } = queryDto;

      const query = this.repository.createQueryBuilder('proveedor');

      if (search) {
        if (searchField === 'nombre') {
          query.where('proveedor.nombre ILIKE :search', { search: `%${search}%` });
        } else if (searchField === 'pais') {
          query.where('proveedor.pais ILIKE :search', { search: `%${search}%` });
        } else if (searchField === 'contacto') {
          query.where('proveedor.contacto ILIKE :search', { search: `%${search}%` });
        } else {
          query.where(
            '(proveedor.nombre ILIKE :search OR proveedor.pais ILIKE :search OR proveedor.contacto ILIKE :search)',
            { search: `%${search}%` },
          );
        }
      }

      if (sort) {
        const allowed = ['nombre', 'pais', 'contacto'];
        const sortField = allowed.includes(sort) ? sort : 'nombre';
        const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';
        query.orderBy(`proveedor.${sortField}`, sortOrder);
      }

      return await paginate<Proveedor>(query, { page, limit });
    } catch (err) {
      console.error('Error fetching proveedores:', err);
      return null;
    }
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateProveedorDto) {
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
