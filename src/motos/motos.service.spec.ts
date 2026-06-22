// src/motos/motos.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MotosService } from './motos.service';
import { Moto } from './moto.entity';

describe('MotosService', () => {
  let service: MotosService;

  // Definimos los mocks fuera del beforeEach para poder acceder
  // a ellos desde los tests
  const mockMotosRepository = {
    create:  jest.fn(),
    save:    jest.fn(),
    findOne: jest.fn(),
    remove:  jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotosService,
        {
          // getRepositoryToken(Moto) devuelve el token de inyección
          // que NestJS usa internamente para Repository<Moto>
          provide: getRepositoryToken(Moto),
          useValue: mockMotosRepository,   // ← usamos el mock
        },
      ],
    }).compile();

    service = module.get<MotosService>(MotosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
