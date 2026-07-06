import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

import { TipoMotorService } from './tipo-motor.service';
import { TipoMotor } from './tipo-motor.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('TipoMotorService', () => {
  let service: TipoMotorService;
  let repository: jest.Mocked<Repository<TipoMotor>>;

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
        TipoMotorService,
        {
          provide: getRepositoryToken(TipoMotor),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TipoMotorService>(TipoMotorService);
    repository = module.get(getRepositoryToken(TipoMotor));
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe crear un tipo de motor', async () => {
    const dto = { nombre: 'Manual' };
    const entity = { id: '1', ...dto };

    repository.create.mockReturnValue(entity as TipoMotor);
    repository.save.mockResolvedValue(entity as TipoMotor);

    const result = await service.create(dto as any);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalled();
    expect(result).toEqual(entity);
  });
});