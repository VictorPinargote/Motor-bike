import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';

describe('ComentariosController', () => {
  let controller: ComentariosController;
  let service: jest.Mocked<ComentariosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComentariosController],
      providers: [
        {
          provide: ComentariosService,
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

    controller = module.get<ComentariosController>(ComentariosController);
    service = module.get(ComentariosService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un comentario y retornar la respuesta de éxito', async () => {
      const dto = { moto_id: 'm1', usuario_id: 'u1', texto: 'Excelente moto' };
      const comentario = { id: '1', ...dto };
      service.create.mockResolvedValue(comentario as any);

      const result = await controller.create(dto as any);

      expect(result).toEqual({ success: true, message: 'Comment created successfully', data: comentario });
    });

    it('debe lanzar InternalServerErrorException si el servicio retorna null', async () => {
      service.create.mockResolvedValue(null);

      await expect(controller.create({} as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('debe retornar los comentarios paginados', async () => {
      const paginado = { items: [], page: 1, limit: 10 };
      service.findAll.mockResolvedValue(paginado as any);

      const result = await controller.findAll(1, 10);

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual({ success: true, message: 'Comments retrieved successfully', data: paginado });
    });

    it('debe lanzar InternalServerErrorException si el servicio retorna null', async () => {
      service.findAll.mockResolvedValue(null);

      await expect(controller.findAll(1, 10)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('debe retornar un comentario existente', async () => {
      const comentario = { id: '1' };
      service.findOne.mockResolvedValue(comentario as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Comment retrieved successfully', data: comentario });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un comentario existente', async () => {
      const dto = { texto: 'Editado' };
      const comentario = { id: '1', texto: 'Editado' };
      service.update.mockResolvedValue(comentario as any);

      const result = await controller.update('1', dto as any);

      expect(result).toEqual({ success: true, message: 'Comment updated successfully', data: comentario });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un comentario existente', async () => {
      const comentario = { id: '1' };
      service.remove.mockResolvedValue(comentario as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Comment deleted successfully', data: comentario });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
