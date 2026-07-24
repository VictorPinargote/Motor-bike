import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';

describe('PagosController', () => {
  let controller: PagosController;
  let service: jest.Mocked<PagosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosController],
      providers: [
        {
          provide: PagosService,
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

    controller = module.get<PagosController>(PagosController);
    service = module.get(PagosService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe registrar un pago y retornar la respuesta de éxito', async () => {
      const dto = { venta_id: 'v1', monto: 100, fecha_pago: '2026-07-05', metodo_pago: 'efectivo' };
      const pago = { id: '1', ...dto };
      service.create.mockResolvedValue(pago as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, message: 'Pago created successfully', data: pago });
    });

    it('debe lanzar InternalServerErrorException si el servicio retorna null', async () => {
      service.create.mockResolvedValue(null);

      await expect(controller.create({} as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('debe limitar el limit a 100 si excede el máximo', async () => {
      const query = { page: 1, limit: 500 };
      const paginado = { items: [], meta: {} };
      service.findAll.mockResolvedValue(paginado as any);

      await controller.findAll(query as any);

      expect(query.limit).toBe(100);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('debe lanzar InternalServerErrorException si el servicio retorna null', async () => {
      service.findAll.mockResolvedValue(null);

      await expect(controller.findAll({ page: 1, limit: 10 } as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('debe retornar un pago existente', async () => {
      const pago = { id: '1' };
      service.findOne.mockResolvedValue(pago as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Pago retrieved successfully', data: pago });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un pago existente', async () => {
      const dto = { monto: 200 };
      const pago = { id: '1', monto: 200 };
      service.update.mockResolvedValue(pago as any);

      const result = await controller.update('1', dto as any);

      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual({ success: true, message: 'Pago updated successfully', data: pago });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un pago existente', async () => {
      const pago = { id: '1' };
      service.remove.mockResolvedValue(pago as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Pago deleted successfully', data: pago });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
