import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { TipoMotorService } from './tipo-motor.service';
import { TipoMotor } from './tipo-motor.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('TipoMotorService', () => {
  let service: TipoMotorService;
  let repository: jest.Mocked<Repository<TipoMotor>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipoMotorService,
        {
          provide: getRepositoryToken(TipoMotor),
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

    service = module.get<TipoMotorService>(TipoMotorService);
    repository = module.get(getRepositoryToken(TipoMotor));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar un tipo de motor correctamente', async () => {
      const dto = { nombre: '4 tiempos' };
      const creado = { id: '1', ...dto } as TipoMotor;
      repository.create.mockReturnValue(creado);
      repository.save.mockResolvedValue(creado);

      const result = await service.create(dto as any);

      expect(repository.save).toHaveBeenCalledWith(creado);
      expect(result).toEqual(creado);
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      repository.create.mockReturnValue({} as TipoMotor);
      repository.save.mockRejectedValue(new Error('db error'));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por nombre y ordenar', async () => {
      const queryDto = { page: 1, limit: 10, search: '4 tiempos', searchField: 'nombre', sort: 'nombre', order: 'DESC' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('tipo_motor.nombre ILIKE :search', { search: '%4 tiempos%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('tipo_motor.nombre', 'DESC');
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
    it('debe buscar un tipo de motor por id', async () => {
      const tipo = { id: '1' } as TipoMotor;
      repository.findOne.mockResolvedValue(tipo);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(tipo);
    });
  });

  describe('update', () => {
    it('debe actualizar un tipo de motor existente', async () => {
      const existente = { id: '1', nombre: '4 tiempos' } as TipoMotor;
      const dto = { nombre: '2 tiempos' };
      repository.findOne.mockResolvedValue(existente);
      repository.save.mockResolvedValue({ ...existente, ...dto });

      const result = await service.update('1', dto as any);

      expect(result).toEqual({ ...existente, ...dto });
    });

    it('debe retornar null si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar un tipo de motor existente', async () => {
      const existente = { id: '1' } as TipoMotor;
      repository.findOne.mockResolvedValue(existente);
      repository.remove.mockResolvedValue(existente);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(existente);
      expect(result).toEqual(existente);
    });

    it('debe retornar null si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
    });
  });
});
