import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { PagosService } from './pagos.service';
import { Pago } from './pago.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('PagosService', () => {
  let service: PagosService;
  let repository: jest.Mocked<Repository<Pago>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: getRepositoryToken(Pago),
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

    service = module.get<PagosService>(PagosService);
    repository = module.get(getRepositoryToken(Pago));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar un pago correctamente', async () => {
      const dto = { venta_id: 'v1', monto: 100, fecha_pago: '2026-07-05', metodo_pago: 'efectivo' };
      const pagoCreado = { id: '1', ...dto } as Pago;
      repository.create.mockReturnValue(pagoCreado);
      repository.save.mockResolvedValue(pagoCreado);

      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(pagoCreado);
      expect(result).toEqual(pagoCreado);
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      repository.create.mockReturnValue({} as Pago);
      repository.save.mockRejectedValue(new Error('db error'));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por metodo_pago y ordenar cuando se envían search y sort', async () => {
      const queryDto = { page: 1, limit: 10, search: 'efectivo', searchField: 'metodo_pago', sort: 'monto', order: 'DESC' };
      const paginado = { items: [], meta: {} };
      (paginateModule.paginate as jest.Mock).mockResolvedValue(paginado);

      const result = await service.findAll(queryDto as any);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('pago');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('pago.metodo_pago ILIKE :search', { search: '%efectivo%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('pago.monto', 'DESC');
      expect(result).toEqual(paginado);
    });

    it('debe usar fecha_pago ASC por defecto cuando el sort no es válido', async () => {
      const queryDto = { page: 1, limit: 10, sort: 'campo_invalido', order: 'ASC' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('pago.fecha_pago', 'ASC');
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
    it('debe buscar un pago por id', async () => {
      const pago = { id: '1' } as Pago;
      repository.findOne.mockResolvedValue(pago);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(pago);
    });
  });

  describe('update', () => {
    it('debe actualizar un pago existente', async () => {
      const existente = { id: '1', monto: 50 } as Pago;
      const dto = { monto: 150 };
      repository.findOne.mockResolvedValue(existente);
      repository.save.mockResolvedValue({ ...existente, ...dto });

      const result = await service.update('1', dto as any);

      expect(repository.save).toHaveBeenCalledWith({ ...existente, ...dto });
      expect(result).toEqual({ ...existente, ...dto });
    });

    it('debe retornar null si el pago no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe eliminar un pago existente', async () => {
      const existente = { id: '1' } as Pago;
      repository.findOne.mockResolvedValue(existente);
      repository.remove.mockResolvedValue(existente);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(existente);
      expect(result).toEqual(existente);
    });

    it('debe retornar null si el pago no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
