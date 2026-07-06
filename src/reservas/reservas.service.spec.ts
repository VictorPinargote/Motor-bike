import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { ReservasService } from './reservas.service';
import { Reserva } from './reserva.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('ReservasService', () => {
  let service: ReservasService;
  let repository: jest.Mocked<Repository<Reserva>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        {
          provide: getRepositoryToken(Reserva),
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

    service = module.get<ReservasService>(ReservasService);
    repository = module.get(getRepositoryToken(Reserva));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar una reserva correctamente', async () => {
      const dto = { usuario_id: 'u1', moto_id: 'm1', estado: 'pendiente' };
      const reservaCreada = { id: '1', ...dto } as Reserva;
      repository.create.mockReturnValue(reservaCreada);
      repository.save.mockResolvedValue(reservaCreada);

      const result = await service.create(dto as any);

      expect(repository.save).toHaveBeenCalledWith(reservaCreada);
      expect(result).toEqual(reservaCreada);
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      repository.create.mockReturnValue({} as Reserva);
      repository.save.mockRejectedValue(new Error('db error'));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por estado cuando searchField es estado', async () => {
      const queryDto = { page: 1, limit: 10, search: 'pendiente', searchField: 'estado', sort: 'estado', order: 'DESC' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('reserva.estado ILIKE :search', { search: '%pendiente%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('reserva.estado', 'DESC');
    });

    it('debe usar fecha_reserva ASC por defecto cuando el sort no es válido', async () => {
      const queryDto = { page: 1, limit: 10, sort: 'campo_invalido', order: 'invalido' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('reserva.fecha_reserva', 'ASC');
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
    it('debe buscar una reserva por id', async () => {
      const reserva = { id: '1' } as Reserva;
      repository.findOne.mockResolvedValue(reserva);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(reserva);
    });
  });

  describe('update', () => {
    it('debe actualizar una reserva existente', async () => {
      const existente = { id: '1', estado: 'pendiente' } as Reserva;
      const dto = { estado: 'confirmada' };
      repository.findOne.mockResolvedValue(existente);
      repository.save.mockResolvedValue({ ...existente, ...dto });

      const result = await service.update('1', dto as any);

      expect(result).toEqual({ ...existente, ...dto });
    });

    it('debe retornar null si la reserva no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar una reserva existente', async () => {
      const existente = { id: '1' } as Reserva;
      repository.findOne.mockResolvedValue(existente);
      repository.remove.mockResolvedValue(existente);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(existente);
      expect(result).toEqual(existente);
    });

    it('debe retornar null si la reserva no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
    });
  });
});
