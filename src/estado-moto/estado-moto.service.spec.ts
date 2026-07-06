import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

import { EstadoMotoService } from './estado-moto.service';
import { EstadoMoto } from './estado-moto.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('EstadoMotoService', () => {
  let service: EstadoMotoService;
  let repository: jest.Mocked<Repository<EstadoMoto>>;
  let consoleErrorSpy: jest.SpyInstance;

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoMotoService,
        {
          provide: getRepositoryToken(EstadoMoto),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EstadoMotoService>(EstadoMotoService);
    repository = module.get(getRepositoryToken(EstadoMoto));

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un estado', async () => {
      const dto = {
        nombre: 'Disponible',
      };

      const entity = {
        id: '1',
        ...dto,
      };

      repository.create.mockReturnValue(entity as EstadoMoto);
      repository.save.mockResolvedValue(entity as EstadoMoto);

      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(entity);
    });

    it('debe retornar null cuando ocurre un error', async () => {
      repository.create.mockImplementation(() => {
        throw new Error();
      });

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe devolver la paginación', async () => {
      const pagination: any = {
        items: [],
        meta: {},
        links: {},
      };

      (paginate as jest.Mock).mockResolvedValue(pagination);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      } as any);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(paginate).toHaveBeenCalled();
      expect(result).toEqual(pagination);
    });
  });

  describe('findOne', () => {
    it('debe encontrar un estado', async () => {
      const entity = {
        id: '1',
        nombre: 'Disponible',
      };

      repository.findOne.mockResolvedValue(entity as EstadoMoto);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(result).toEqual(entity);
    });
  });

  describe('update', () => {
    it('debe actualizar un estado', async () => {
      const entity = {
        id: '1',
        nombre: 'Disponible',
      };

      repository.findOne.mockResolvedValue(entity as EstadoMoto);

      repository.save.mockResolvedValue({
        ...entity,
        nombre: 'Vendido',
      } as EstadoMoto);

      const result = await service.update('1', {
        nombre: 'Vendido',
      } as any);

      expect(repository.save).toHaveBeenCalled();
      expect(result?.nombre).toBe('Vendido');
    });

    it('debe devolver null cuando no exista', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('100', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar un estado', async () => {
      const entity = {
        id: '1',
        nombre: 'Disponible',
      };

      repository.findOne.mockResolvedValue(entity as EstadoMoto);
      repository.remove.mockResolvedValue(entity as EstadoMoto);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('debe devolver null cuando no exista', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('100');

      expect(result).toBeNull();
    });
  });
});