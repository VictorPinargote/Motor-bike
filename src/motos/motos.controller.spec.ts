import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { MotosController } from './motos.controller';
import { MotosService } from './motos.service';

describe('MotosController', () => {
  let controller: MotosController;
  let service: jest.Mocked<MotosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotosController],
      providers: [
        {
          provide: MotosService,
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

    controller = module.get<MotosController>(MotosController);
    service = module.get(MotosService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una moto y retornar la respuesta de éxito', async () => {
      const dto = { modelo: 'CBR 500', precio: 8000, stock: 5 };
      const moto = { id: '1', ...dto };
      service.create.mockResolvedValue(moto as any);

      const result = await controller.create(dto as any);

      expect(result).toEqual({ success: true, message: 'Moto created successfully', data: moto });
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
    it('debe retornar una moto existente', async () => {
      const moto = { id: '1' };
      service.findOne.mockResolvedValue(moto as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Moto retrieved successfully', data: moto });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una moto existente', async () => {
      const dto = { stock: 2 };
      const moto = { id: '1', stock: 2 };
      service.update.mockResolvedValue(moto as any);

      const result = await controller.update('1', dto as any);

      expect(result).toEqual({ success: true, message: 'Moto updated successfully', data: moto });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una moto existente', async () => {
      const moto = { id: '1' };
      service.remove.mockResolvedValue(moto as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Moto deleted successfully', data: moto });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
