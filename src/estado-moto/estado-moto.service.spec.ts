import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { EstadoMotoService } from './estado-moto.service';
import { EstadoMoto } from './estado-moto.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('EstadoMotoService', () => {
  let service: EstadoMotoService;
  let repository: jest.Mocked<Repository<EstadoMoto>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoMotoService,
        {
          provide: getRepositoryToken(EstadoMoto),
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

    service = module.get<EstadoMotoService>(EstadoMotoService);
    repository = module.get(getRepositoryToken(EstadoMoto));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar un estado de moto correctamente', async () => {
      const dto = { nombre: 'Nueva' };
      const creado = { id: '1', ...dto } as EstadoMoto;
      repository.create.mockReturnValue(creado);
      repository.save.mockResolvedValue(creado);

      const result = await service.create(dto as any);

      expect(repository.save).toHaveBeenCalledWith(creado);
      expect(result).toEqual(creado);
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      repository.create.mockReturnValue({} as EstadoMoto);
      repository.save.mockRejectedValue(new Error('db error'));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por nombre y ordenar', async () => {
      const queryDto = { page: 1, limit: 10, search: 'nueva', searchField: 'nombre', sort: 'nombre', order: 'DESC' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('estado_moto.nombre ILIKE :search', { search: '%nueva%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('estado_moto.nombre', 'DESC');
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
    it('debe buscar un estado de moto por id', async () => {
      const estado = { id: '1' } as EstadoMoto;
      repository.findOne.mockResolvedValue(estado);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(estado);
    });
  });

  describe('update', () => {
    it('debe actualizar un estado de moto existente', async () => {
      const existente = { id: '1', nombre: 'Nueva' } as EstadoMoto;
      const dto = { nombre: 'Usada' };
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
    it('debe eliminar un estado de moto existente', async () => {
      const existente = { id: '1' } as EstadoMoto;
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
