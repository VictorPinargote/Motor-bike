import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

import { MotosService } from './motos.service';
import { Moto } from './moto.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('MotosService', () => {
  let service: MotosService;
  let repository: jest.Mocked<Repository<Moto>>;
  let consoleErrorSpy: jest.SpyInstance;

  const queryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotosService,
        {
          provide: getRepositoryToken(Moto),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MotosService>(MotosService);
    repository = module.get(getRepositoryToken(Moto));

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una moto', async () => {
      const dto = {
        modelo: 'MT-07',
        precio: 9800,
        stock: 4,
      };

      const entity = {
        id: '1',
        ...dto,
      };

      repository.create.mockReturnValue(entity as Moto);
      repository.save.mockResolvedValue(entity as Moto);

      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(entity);
    });

    it('debe retornar null cuando exista un error', async () => {
      repository.create.mockImplementation(() => {
        throw new Error();
      });

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe paginar correctamente', async () => {
      const pagination = {
        items: [],
        meta: {},
        links: {},
      };

      (paginate as jest.Mock).mockResolvedValue(pagination);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sort: 'modelo',
        order: 'ASC',
      } as any);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'moto.modelo',
        'ASC',
      );
      expect(result).toEqual(pagination);
    });

    it('debe buscar por modelo', async () => {
      (paginate as jest.Mock).mockResolvedValue({
        items: [],
        meta: {},
        links: {},
      });

      await service.findAll({
        page: 1,
        limit: 10,
        search: 'MT',
      } as any);

      expect(queryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debe encontrar una moto', async () => {
      const moto = {
        id: '1',
        modelo: 'R3',
      };

      repository.findOne.mockResolvedValue(moto as Moto);

      const result = await service.findOne('1');

      expect(result).toEqual(moto);
    });

    it('debe devolver null si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne('100');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar una moto', async () => {
      const moto = {
        id: '1',
        modelo: 'R3',
      };

      repository.findOne.mockResolvedValue(moto as Moto);

      repository.save.mockResolvedValue({
        ...moto,
        modelo: 'R6',
      } as Moto);

      const result = await service.update('1', {
        modelo: 'R6',
      } as any);

      expect(repository.save).toHaveBeenCalled();
      expect(result?.modelo).toBe('R6');
    });

    it('debe devolver null cuando no exista', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('100', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar una moto', async () => {
      const moto = {
        id: '1',
        modelo: 'MT09',
      };

      repository.findOne.mockResolvedValue(moto as Moto);
      repository.remove.mockResolvedValue(moto as Moto);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(moto);
      expect(result).toEqual(moto);
    });

    it('debe devolver null cuando no exista', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('100');

      expect(result).toBeNull();
    });
  });
});