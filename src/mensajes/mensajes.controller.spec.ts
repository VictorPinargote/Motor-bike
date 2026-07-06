import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { MensajesController } from './mensajes.controller';
import { MensajesService } from './mensajes.service';

describe('MensajesController', () => {
  let controller: MensajesController;
  let service: jest.Mocked<MensajesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MensajesController],
      providers: [
        {
          provide: MensajesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MensajesController>(MensajesController);
    service = module.get(MensajesService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe enviar un mensaje y retornar la respuesta de éxito', async () => {
      const dto = { remitente_id: 'u1', destinatario_id: 'u2', contenido: 'Hola' };
      const mensaje = { id: '1', ...dto };
      service.create.mockResolvedValue(mensaje as any);

      const result = await controller.create(dto as any);

      expect(result).toEqual({ success: true, message: 'Message sent successfully', data: mensaje });
    });

    it('debe lanzar InternalServerErrorException si el servicio retorna null', async () => {
      service.create.mockResolvedValue(null);

      await expect(controller.create({} as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('debe retornar los mensajes paginados', async () => {
      const paginado = { items: [], page: 1, limit: 10 };
      service.findAll.mockResolvedValue(paginado as any);

      const result = await controller.findAll(1, 10);

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual({ success: true, message: 'Messages retrieved successfully', data: paginado });
    });

    it('debe lanzar InternalServerErrorException si el servicio retorna null', async () => {
      service.findAll.mockResolvedValue(null);

      await expect(controller.findAll(1, 10)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('debe retornar un mensaje existente', async () => {
      const mensaje = { id: '1' };
      service.findOne.mockResolvedValue(mensaje as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'Message retrieved successfully', data: mensaje });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un mensaje existente', async () => {
      const mensaje = { id: '1' };
      service.remove.mockResolvedValue(mensaje as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'Message deleted successfully', data: mensaje });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
