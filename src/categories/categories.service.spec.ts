import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoriesService } from './categories.service';
import { Categoria } from './categories.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<Repository<Categoria>>;
  let consoleErrorSpy: jest.SpyInstance;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Categoria),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(getRepositoryToken(Categoria));
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una categoría', async () => {
      const dto = {
        nombre: 'Deportivas',
        descripcion: 'Motos deportivas',
      };

      const entity = { id: '1', ...dto };

      repository.create.mockReturnValue(entity as Categoria);
      repository.save.mockResolvedValue(entity as Categoria);

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

  describe('findOne', () => {
    it('debe encontrar una categoría', async () => {
      const entity = {
        id: '1',
        nombre: 'Scooter',
      };

      repository.findOne.mockResolvedValue(entity as Categoria);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(result).toEqual(entity);
    });

    it('debe devolver null si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne('100');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar una categoría', async () => {
      const entity = {
        id: '1',
        nombre: 'Vieja',
      };

      repository.findOne.mockResolvedValue(entity as Categoria);
      repository.save.mockResolvedValue({
        ...entity,
        nombre: 'Nueva',
      } as Categoria);

      const result = await service.update('1', {
        nombre: 'Nueva',
      } as any);

      expect(repository.save).toHaveBeenCalled();
      expect(result?.nombre).toBe('Nueva');
    });
  });

  describe('remove', () => {
    it('debe eliminar una categoría', async () => {
      const entity = {
        id: '1',
        nombre: 'Scooter',
      };

      repository.findOne.mockResolvedValue(entity as Categoria);
      repository.remove.mockResolvedValue(entity as Categoria);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });
});