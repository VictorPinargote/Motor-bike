import { Test, TestingModule } from '@nestjs/testing';
import { MotosService } from './motos.service';

describe('MotosService', () => {
  let service: MotosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotosService],
    }).compile();

    service = module.get<MotosService>(MotosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
