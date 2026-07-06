import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { VentasService } from './ventas.service';
import { Venta } from './venta.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('VentasService', () => {
  let service: VentasService;
  let repository: jest.Mocked<Repository<Venta>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        {
          provide: getRepositoryToken(Venta),
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

    service = module.get<VentasService>(VentasService);
    repository = module.get(getRepositoryToken(Venta));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar una venta con fecha_venta automática', async () => {
      const dto = { usuario_id: 'u1', moto_id: 'm1', precio_venta: 8000, metodo_pago: 'efectivo', estado: 'pendiente' };
      const ventaCreada = { id: '1', ...dto, fecha_venta: expect.any(Date) };
      repository.create.mockImplementation((v: any) => v);
      repository.save.mockImplementation(async (v: any) => ({ id: '1', ...v }));

      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ ...dto, fecha_venta: expect.any(Date) }));
      expect(result).toEqual(expect.objectContaining({ id: '1', ...dto }));
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      repository.create.mockReturnValue({} as Venta);
      repository.save.mockRejectedValue(new Error('db error'));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por estado cuando searchField es estado', async () => {
      const queryDto = { page: 1, limit: 10, search: 'pendiente', searchField: 'estado', sort: 'precio_venta', order: 'DESC' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('venta.estado ILIKE :search', { search: '%pendiente%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('venta.precio_venta', 'DESC');
    });

    it('debe usar fecha_venta ASC por defecto cuando el sort no es válido', async () => {
      const queryDto = { page: 1, limit: 10, sort: 'campo_invalido', order: 'invalido' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('venta.fecha_venta', 'ASC');
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
    it('debe buscar una venta por id', async () => {
      const venta = { id: '1' } as Venta;
      repository.findOne.mockResolvedValue(venta);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(venta);
    });
  });

  describe('update', () => {
    it('debe actualizar una venta existente', async () => {
      const existente = { id: '1', estado: 'pendiente' } as Venta;
      const dto = { estado: 'completada' };
      repository.findOne.mockResolvedValue(existente);
      repository.save.mockResolvedValue({ ...existente, ...dto });

      const result = await service.update('1', dto as any);

      expect(result).toEqual({ ...existente, ...dto });
    });

    it('debe retornar null si la venta no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar una venta existente', async () => {
      const existente = { id: '1' } as Venta;
      repository.findOne.mockResolvedValue(existente);
      repository.remove.mockResolvedValue(existente);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(existente);
      expect(result).toEqual(existente);
    });

    it('debe retornar null si la venta no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
    });
  });
});
