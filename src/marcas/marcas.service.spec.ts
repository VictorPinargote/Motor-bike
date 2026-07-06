import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { MarcasService } from './marcas.service';
import { Marca } from './marca.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('MarcasService', () => {
  let service: MarcasService;
  let repository: jest.Mocked<Repository<Marca>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcasService,
        {
          provide: getRepositoryToken(Marca),
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

    service = module.get<MarcasService>(MarcasService);
    repository = module.get(getRepositoryToken(Marca));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar una marca correctamente', async () => {
      const dto = { nombre: 'Honda', pais: 'Japón' };
      const marcaCreada = { id: '1', ...dto } as Marca;
      repository.create.mockReturnValue(marcaCreada);
      repository.save.mockResolvedValue(marcaCreada);

      const result = await service.create(dto as any);

      expect(repository.save).toHaveBeenCalledWith(marcaCreada);
      expect(result).toEqual(marcaCreada);
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      repository.create.mockReturnValue({} as Marca);
      repository.save.mockRejectedValue(new Error('db error'));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por pais cuando searchField es pais', async () => {
      const queryDto = { page: 1, limit: 10, search: 'Japón', searchField: 'pais', sort: 'nombre', order: 'DESC' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('marca.pais ILIKE :search', { search: '%Japón%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('marca.nombre', 'DESC');
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
    it('debe buscar una marca por id', async () => {
      const marca = { id: '1' } as Marca;
      repository.findOne.mockResolvedValue(marca);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(marca);
    });
  });

  describe('update', () => {
    it('debe actualizar una marca existente', async () => {
      const existente = { id: '1', nombre: 'Honda' } as Marca;
      const dto = { nombre: 'Yamaha' };
      repository.findOne.mockResolvedValue(existente);
      repository.save.mockResolvedValue({ ...existente, ...dto });

      const result = await service.update('1', dto as any);

      expect(result).toEqual({ ...existente, ...dto });
    });

    it('debe retornar null si la marca no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar una marca existente', async () => {
      const existente = { id: '1' } as Marca;
      repository.findOne.mockResolvedValue(existente);
      repository.remove.mockResolvedValue(existente);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(existente);
      expect(result).toEqual(existente);
    });

    it('debe retornar null si la marca no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
    });
  });
});
