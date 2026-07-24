import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { EstadoMotoController } from './estado-moto.controller';
import { EstadoMotoService } from './estado-moto.service';

describe('EstadoMotoController', () => {
  let controller: EstadoMotoController;
  let service: jest.Mocked<EstadoMotoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoMotoController],
      providers: [
        {
          provide: EstadoMotoService,
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

    controller = module.get<EstadoMotoController>(EstadoMotoController);
    service = module.get(EstadoMotoService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un estado de moto y retornar la respuesta de éxito', async () => {
      const dto = { nombre: 'Nueva' };
      const estado = { id: '1', ...dto };
      service.create.mockResolvedValue(estado as any);

      const result = await controller.create(dto as any);

      expect(result).toEqual({ success: true, message: 'Estado de moto created successfully', data: estado });
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
    it('debe retornar un estado de moto existente', async () => {
      const estado = { id: '1' };
      service.findOne.mockResolvedValue(estado as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Estado de moto retrieved successfully', data: estado });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un estado de moto existente', async () => {
      const dto = { nombre: 'Usada' };
      const estado = { id: '1', nombre: 'Usada' };
      service.update.mockResolvedValue(estado as any);

      const result = await controller.update('1', dto as any);

      expect(result).toEqual({ success: true, message: 'Estado de moto updated successfully', data: estado });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un estado de moto existente', async () => {
      const estado = { id: '1' };
      service.remove.mockResolvedValue(estado as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Estado de moto deleted successfully', data: estado });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
