import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MensajesService } from './mensajes.service';
import { Mensaje } from './schemas/mensaje.schema';

describe('MensajesService', () => {
  let service: MensajesService;
  let modelMock: any;
  let queryMock: any;

  beforeEach(async () => {
    queryMock = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn(),
    };

    modelMock = jest.fn().mockImplementation((dto: any) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ id: '1', ...dto }),
    }));
    modelMock.find = jest.fn(() => queryMock);
    modelMock.findById = jest.fn();
    modelMock.findByIdAndDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensajesService,
        {
          provide: getModelToken(Mensaje.name),
          useValue: modelMock,
        },
      ],
    }).compile();

    service = module.get<MensajesService>(MensajesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar un mensaje correctamente', async () => {
      const dto = { remitente_id: 'u1', destinatario_id: 'u2', contenido: 'Hola' };

      const result = await service.create(dto as any);

      expect(modelMock).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: '1', ...dto });
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      modelMock.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('db error')),
      }));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe retornar los mensajes paginados', async () => {
      const mensajes = [{ id: '1' }, { id: '2' }];
      queryMock.sort.mockResolvedValue(mensajes);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(queryMock.skip).toHaveBeenCalledWith(0);
      expect(queryMock.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual({ items: mensajes, page: 1, limit: 10 });
    });

    it('debe retornar null si ocurre un error', async () => {
      queryMock.sort.mockRejectedValue(new Error('db error'));

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('debe buscar un mensaje por id', async () => {
      const mensaje = { id: '1' };
      modelMock.findById.mockResolvedValue(mensaje);

      const result = await service.findOne('1');

      expect(modelMock.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mensaje);
    });

    it('debe retornar null si ocurre un error', async () => {
      modelMock.findById.mockRejectedValue(new Error('db error'));

      const result = await service.findOne('1');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar un mensaje existente', async () => {
      const eliminado = { id: '1' };
      modelMock.findByIdAndDelete.mockResolvedValue(eliminado);

      const result = await service.remove('1');

      expect(modelMock.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual(eliminado);
    });

    it('debe retornar null si no existe', async () => {
      modelMock.findByIdAndDelete.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
    });
  });
});
