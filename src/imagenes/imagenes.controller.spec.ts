import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ImagenesController } from './imagenes.controller';
import { ImagenesService } from './imagenes.service';

describe('ImagenesController', () => {
  let controller: ImagenesController;
  let service: jest.Mocked<ImagenesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagenesController],
      providers: [
        {
          provide: ImagenesService,
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

    controller = module.get<ImagenesController>(ImagenesController);
    service = module.get(ImagenesService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe registrar una imagen y retornar la respuesta de éxito', async () => {
      const dto = { moto_id: 'm1', url: 'http://img.png', descripcion: 'frontal', orden: 1 };
      const imagen = { id: '1', ...dto };
      service.create.mockResolvedValue(imagen as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, message: 'Imagen created successfully', data: imagen });
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
    it('debe retornar una imagen existente', async () => {
      const imagen = { id: '1' };
      service.findOne.mockResolvedValue(imagen as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Imagen retrieved successfully', data: imagen });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una imagen existente', async () => {
      const dto = { orden: 2 };
      const imagen = { id: '1', orden: 2 };
      service.update.mockResolvedValue(imagen as any);

      const result = await controller.update('1', dto as any);

      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual({ success: true, message: 'Imagen updated successfully', data: imagen });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una imagen existente', async () => {
      const imagen = { id: '1' };
      service.remove.mockResolvedValue(imagen as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Imagen deleted successfully', data: imagen });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
