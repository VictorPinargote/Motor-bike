import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ComentariosService } from './comentarios.service';
import { Comentario } from './schemas/comentario.schema';

describe('ComentariosService', () => {
  let service: ComentariosService;
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
    modelMock.findByIdAndUpdate = jest.fn();
    modelMock.findByIdAndDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComentariosService,
        {
          provide: getModelToken(Comentario.name),
          useValue: modelMock,
        },
      ],
    }).compile();

    service = module.get<ComentariosService>(ComentariosService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar un comentario correctamente', async () => {
      const dto = { moto_id: 'm1', usuario_id: 'u1', texto: 'Excelente moto' };

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
    it('debe retornar los comentarios paginados', async () => {
      const comentarios = [{ id: '1' }, { id: '2' }];
      queryMock.sort.mockResolvedValue(comentarios);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(queryMock.skip).toHaveBeenCalledWith(0);
      expect(queryMock.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual({ items: comentarios, page: 1, limit: 10 });
    });

    it('debe retornar null si ocurre un error', async () => {
      queryMock.sort.mockRejectedValue(new Error('db error'));

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('debe buscar un comentario por id', async () => {
      const comentario = { id: '1' };
      modelMock.findById.mockResolvedValue(comentario);

      const result = await service.findOne('1');

      expect(modelMock.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(comentario);
    });

    it('debe retornar null si ocurre un error', async () => {
      modelMock.findById.mockRejectedValue(new Error('db error'));

      const result = await service.findOne('1');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar un comentario existente', async () => {
      const actualizado = { id: '1', texto: 'Editado' };
      modelMock.findByIdAndUpdate.mockResolvedValue(actualizado);

      const result = await service.update('1', { texto: 'Editado' } as any);

      expect(modelMock.findByIdAndUpdate).toHaveBeenCalledWith('1', { texto: 'Editado' }, { new: true });
      expect(result).toEqual(actualizado);
    });

    it('debe retornar null si no existe', async () => {
      modelMock.findByIdAndUpdate.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar un comentario existente', async () => {
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
