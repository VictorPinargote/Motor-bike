import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReservasService } from './reservas.service';
import { Reserva } from './reserva.entity';

describe('ReservasService', () => {
  let service: ReservasService;
  let repository: jest.Mocked<Repository<Reserva>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        {
          provide: getRepositoryToken(Reserva),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReservasService>(ReservasService);
    repository = module.get(getRepositoryToken(Reserva));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a reservation', async () => {
    const dto = { usuario_id: '1', moto_id: '2', estado: 'pendiente' };
    const entity = { id: '1', ...dto };

    repository.create.mockReturnValue(entity as Reserva);
    repository.save.mockResolvedValue(entity as Reserva);

    const result = await service.create(dto as any);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalled();
    expect(result).toEqual(entity);
  });
});
