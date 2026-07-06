import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';

describe('ReservasController', () => {
  let controller: ReservasController;
  let service: jest.Mocked<ReservasService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [
        {
          provide: ReservasService,
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

    controller = module.get<ReservasController>(ReservasController);
    service = module.get(ReservasService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una reserva y retornar la respuesta de éxito', async () => {
      const dto = { usuario_id: 'u1', moto_id: 'm1', estado: 'pendiente' };
      const reserva = { id: '1', ...dto };
      service.create.mockResolvedValue(reserva as any);

      const result = await controller.create(dto as any);

      expect(result).toEqual({ success: true, message: 'Reserva created successfully', data: reserva });
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
    it('debe retornar una reserva existente', async () => {
      const reserva = { id: '1' };
      service.findOne.mockResolvedValue(reserva as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Reserva retrieved successfully', data: reserva });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una reserva existente', async () => {
      const dto = { estado: 'confirmada' };
      const reserva = { id: '1', estado: 'confirmada' };
      service.update.mockResolvedValue(reserva as any);

      const result = await controller.update('1', dto as any);

      expect(result).toEqual({ success: true, message: 'Reserva updated successfully', data: reserva });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una reserva existente', async () => {
      const reserva = { id: '1' };
      service.remove.mockResolvedValue(reserva as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Reserva deleted successfully', data: reserva });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
