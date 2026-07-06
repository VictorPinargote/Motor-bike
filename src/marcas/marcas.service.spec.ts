import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MarcasService } from './marcas.service';
import { Marca } from './marca.entity';

describe('MarcasService', () => {
  let service: MarcasService;
  let repository: jest.Mocked<Repository<Marca>>;
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
        MarcasService,
        {
          provide: getRepositoryToken(Marca),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MarcasService>(MarcasService);
    repository = module.get(getRepositoryToken(Marca));

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una marca', async () => {
      const dto = {
        nombre: 'Yamaha',
        pais: 'Japón',
      };

      const entity = {
        id: '1',
        ...dto,
      };

      repository.create.mockReturnValue(entity as Marca);
      repository.save.mockResolvedValue(entity as Marca);

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
    it('debe encontrar una marca', async () => {
      const entity = {
        id: '1',
        nombre: 'Honda',
      };

      repository.findOne.mockResolvedValue(entity as Marca);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(result).toEqual(entity);
    });

    it('debe devolver null cuando no exista', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne('20');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar una marca', async () => {
      const entity = {
        id: '1',
        nombre: 'Honda',
        pais: 'Japón',
      };

      repository.findOne.mockResolvedValue(entity as Marca);

      repository.save.mockResolvedValue({
        ...entity,
        nombre: 'Suzuki',
      } as Marca);

      const result = await service.update('1', {
        nombre: 'Suzuki',
      } as any);

      expect(repository.save).toHaveBeenCalled();
      expect(result?.nombre).toBe('Suzuki');
    });

    it('debe devolver null si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('100', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar una marca', async () => {
      const entity = {
        id: '1',
        nombre: 'Honda',
      };

      repository.findOne.mockResolvedValue(entity as Marca);

      repository.remove.mockResolvedValue(entity as Marca);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('debe devolver null cuando no exista', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('1');

      expect(result).toBeNull();
    });
  });
});