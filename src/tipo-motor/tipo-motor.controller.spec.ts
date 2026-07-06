import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { TipoMotorController } from './tipo-motor.controller';
import { TipoMotorService } from './tipo-motor.service';

describe('TipoMotorController', () => {
  let controller: TipoMotorController;
  let service: jest.Mocked<TipoMotorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoMotorController],
      providers: [
        {
          provide: TipoMotorService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TipoMotorController>(TipoMotorController);
    service = module.get(TipoMotorService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un tipo de motor y retornar la respuesta de éxito', async () => {
      const dto = { nombre: '4 tiempos' };
      const tipo = { id: '1', ...dto };
      service.create.mockResolvedValue(tipo as any);

      const result = await controller.create(dto as any);

      expect(result).toEqual({ success: true, message: 'Tipo de motor created successfully', data: tipo });
    });

    it('debe lanzar InternalServerErrorException si el servicio retorna null', async () => {
      service.create.mockResolvedValue(null);

      await expect(controller.create({} as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('debe limitar el limit a 100 si excede el máximo', async () => {
      const query = { page: 1, limit: 500 };
      service.findAll.mockResolvedValue({ items: [], meta: {} } as any);

      await controller.findAll(query as any);

      expect(query.limit).toBe(100);
    });

    it('debe lanzar InternalServerErrorException si el servicio retorna null', async () => {
      service.findAll.mockResolvedValue(null);

      await expect(controller.findAll({ page: 1, limit: 10 } as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('debe retornar un tipo de motor existente', async () => {
      const tipo = { id: '1' };
      service.findOne.mockResolvedValue(tipo as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Tipo de motor retrieved successfully', data: tipo });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un tipo de motor existente', async () => {
      const dto = { nombre: '2 tiempos' };
      const tipo = { id: '1', nombre: '2 tiempos' };
      service.update.mockResolvedValue(tipo as any);

      const result = await controller.update('1', dto as any);

      expect(result).toEqual({ success: true, message: 'Tipo de motor updated successfully', data: tipo });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un tipo de motor existente', async () => {
      const tipo = { id: '1' };
      service.remove.mockResolvedValue(tipo as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Tipo de motor deleted successfully', data: tipo });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
