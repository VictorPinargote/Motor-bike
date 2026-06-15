import { Test, TestingModule } from '@nestjs/testing';
import { MotosController } from './motos.controller';

describe('MotosController', () => {
  let controller: MotosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotosController],
    }).compile();

    controller = module.get<MotosController>(MotosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
