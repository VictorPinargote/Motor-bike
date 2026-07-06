import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { CategoriesService } from './categories.service';
import { Categoria } from './categories.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<Repository<Categoria>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Categoria),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(getRepositoryToken(Categoria));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar una categoría correctamente', async () => {
      const dto = { nombre: 'Deportiva', descripcion: 'Motos de alto rendimiento' };
      const categoriaCreada = { id: '1', ...dto } as Categoria;
      repository.create.mockReturnValue(categoriaCreada);
      repository.save.mockResolvedValue(categoriaCreada);

      const result = await service.create(dto as any);

      expect(repository.save).toHaveBeenCalledWith(categoriaCreada);
      expect(result).toEqual(categoriaCreada);
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      repository.create.mockReturnValue({} as Categoria);
      repository.save.mockRejectedValue(new Error('db error'));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por descripcion cuando searchField es descripcion', async () => {
      const queryDto = { page: 1, limit: 10, search: 'rendimiento', searchField: 'descripcion', sort: 'nombre', order: 'DESC' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('categoria.descripcion ILIKE :search', { search: '%rendimiento%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('categoria.nombre', 'DESC');
    });

    it('debe retornar null si ocurre un error', async () => {
      repository.createQueryBuilder.mockImplementation(() => {
        throw new Error('fail');
      });

      const result = await service.findAll({ page: 1, limit: 10 } as any);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('debe buscar una categoría por id', async () => {
      const categoria = { id: '1' } as Categoria;
      repository.findOne.mockResolvedValue(categoria);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(categoria);
    });

    it('debe retornar null si ocurre un error', async () => {
      repository.findOne.mockRejectedValue(new Error('fail'));

      const result = await service.findOne('1');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar una categoría existente', async () => {
      const existente = { id: '1', nombre: 'Deportiva' } as Categoria;
      const dto = { nombre: 'Urbana' };
      repository.findOne.mockResolvedValue(existente);
      repository.save.mockResolvedValue({ ...existente, ...dto });

      const result = await service.update('1', dto as any);

      expect(result).toEqual({ ...existente, ...dto });
    });

    it('debe retornar null si la categoría no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar una categoría existente', async () => {
      const existente = { id: '1' } as Categoria;
      repository.findOne.mockResolvedValue(existente);
      repository.remove.mockResolvedValue(existente);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(existente);
      expect(result).toEqual(existente);
    });

    it('debe retornar null si la categoría no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
    });
  });
});
