import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

describe('VentasController', () => {
  let controller: VentasController;
  let service: jest.Mocked<VentasService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentasController],
      providers: [
        {
          provide: VentasService,
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

    controller = module.get<VentasController>(VentasController);
    service = module.get(VentasService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe registrar una venta y retornar la respuesta de éxito', async () => {
      const dto = { usuario_id: 'u1', moto_id: 'm1', precio_venta: 8000, metodo_pago: 'efectivo', estado: 'pendiente' };
      const venta = { id: '1', ...dto };
      service.create.mockResolvedValue(venta as any);

      const result = await controller.create(dto as any);

      expect(result).toEqual({ success: true, message: 'Venta created successfully', data: venta });
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
    it('debe retornar una venta existente', async () => {
      const venta = { id: '1' };
      service.findOne.mockResolvedValue(venta as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Venta retrieved successfully', data: venta });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una venta existente', async () => {
      const dto = { estado: 'completada' };
      const venta = { id: '1', estado: 'completada' };
      service.update.mockResolvedValue(venta as any);

      const result = await controller.update('1', dto as any);

      expect(result).toEqual({ success: true, message: 'Venta updated successfully', data: venta });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una venta existente', async () => {
      const venta = { id: '1' };
      service.remove.mockResolvedValue(venta as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Venta deleted successfully', data: venta });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
