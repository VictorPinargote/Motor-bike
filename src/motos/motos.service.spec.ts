import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { MotosService } from './motos.service';
import { Moto } from './moto.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('MotosService', () => {
  let service: MotosService;
  let repository: jest.Mocked<Repository<Moto>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotosService,
        {
          provide: getRepositoryToken(Moto),
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

    service = module.get<MotosService>(MotosService);
    repository = module.get(getRepositoryToken(Moto));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar una moto correctamente', async () => {
      const dto = { modelo: 'CBR 500', precio: 8000, stock: 5 };
      const motoCreada = { id: '1', ...dto } as Moto;
      repository.create.mockReturnValue(motoCreada);
      repository.save.mockResolvedValue(motoCreada);

      const result = await service.create(dto as any);

      expect(repository.save).toHaveBeenCalledWith(motoCreada);
      expect(result).toEqual(motoCreada);
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      repository.create.mockReturnValue({} as Moto);
      repository.save.mockRejectedValue(new Error('db error'));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por modelo y ordenar cuando se envían search y sort', async () => {
      const queryDto = { page: 1, limit: 10, search: 'CBR', searchField: 'modelo', sort: 'precio', order: 'DESC' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('moto.modelo ILIKE :search', { search: '%CBR%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('moto.precio', 'DESC');
    });

    it('debe usar modelo ASC por defecto cuando el sort no es válido', async () => {
      const queryDto = { page: 1, limit: 10, sort: 'campo_invalido', order: 'invalido' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('moto.modelo', 'ASC');
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
    it('debe buscar una moto por id', async () => {
      const moto = { id: '1' } as Moto;
      repository.findOne.mockResolvedValue(moto);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(moto);
    });
  });

  describe('update', () => {
    it('debe actualizar una moto existente', async () => {
      const existente = { id: '1', stock: 5 } as Moto;
      const dto = { stock: 3 };
      repository.findOne.mockResolvedValue(existente);
      repository.save.mockResolvedValue({ ...existente, ...dto });

      const result = await service.update('1', dto as any);

      expect(result).toEqual({ ...existente, ...dto });
    });

    it('debe retornar null si la moto no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe eliminar una moto existente', async () => {
      const existente = { id: '1' } as Moto;
      repository.findOne.mockResolvedValue(existente);
      repository.remove.mockResolvedValue(existente);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(existente);
      expect(result).toEqual(existente);
    });

    it('debe retornar null si la moto no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
    });
  });
});
