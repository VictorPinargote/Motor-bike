import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { MarcasController } from './marcas.controller';
import { MarcasService } from './marcas.service';

describe('MarcasController', () => {
  let controller: MarcasController;
  let service: jest.Mocked<MarcasService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarcasController],
      providers: [
        {
          provide: MarcasService,
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

    controller = module.get<MarcasController>(MarcasController);
    service = module.get(MarcasService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una marca y retornar la respuesta de éxito', async () => {
      const dto = { nombre: 'Honda', pais: 'Japón' };
      const marca = { id: '1', ...dto };
      service.create.mockResolvedValue(marca as any);

      const result = await controller.create(dto as any);

      expect(result).toEqual({ success: true, message: 'Marca created successfully', data: marca });
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
    it('debe retornar una marca existente', async () => {
      const marca = { id: '1' };
      service.findOne.mockResolvedValue(marca as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Marca retrieved successfully', data: marca });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una marca existente', async () => {
      const dto = { nombre: 'Yamaha' };
      const marca = { id: '1', nombre: 'Yamaha' };
      service.update.mockResolvedValue(marca as any);

      const result = await controller.update('1', dto as any);

      expect(result).toEqual({ success: true, message: 'Marca updated successfully', data: marca });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una marca existente', async () => {
      const marca = { id: '1' };
      service.remove.mockResolvedValue(marca as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Marca deleted successfully', data: marca });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
