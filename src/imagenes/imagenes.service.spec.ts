import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { ImagenesService } from './imagenes.service';
import { Imagen } from './imagen.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('ImagenesService', () => {
  let service: ImagenesService;
  let repository: jest.Mocked<Repository<Imagen>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagenesService,
        {
          provide: getRepositoryToken(Imagen),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<ImagenesService>(ImagenesService);
    repository = module.get(getRepositoryToken(Imagen));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y guardar una imagen correctamente', async () => {
      const dto = { moto_id: 'm1', url: 'http://img.png', descripcion: 'frontal', orden: 1 };
      const imagenCreada = { id: '1', ...dto } as Imagen;
      repository.create.mockReturnValue(imagenCreada);
      repository.save.mockResolvedValue(imagenCreada);

      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(imagenCreada);
      expect(result).toEqual(imagenCreada);
    });

    it('debe retornar null si ocurre un error al guardar', async () => {
      repository.create.mockReturnValue({} as Imagen);
      repository.save.mockRejectedValue(new Error('db error'));

      const result = await service.create({} as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por descripcion y ordenar cuando se envían search y sort', async () => {
      const queryDto = { page: 1, limit: 10, search: 'frontal', sort: 'url', order: 'DESC' };
      const paginado = { items: [], meta: {} };
      (paginateModule.paginate as jest.Mock).mockResolvedValue(paginado);

      const result = await service.findAll(queryDto as any);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('imagen');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('imagen.descripcion ILIKE :search', { search: '%frontal%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('imagen.url', 'DESC');
      expect(result).toEqual(paginado);
    });

    it('debe usar orden ASC por defecto cuando el sort no es válido', async () => {
      const queryDto = { page: 1, limit: 10, sort: 'campo_invalido', order: 'ASC' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('imagen.orden', 'ASC');
    });

    it('debe retornar null si ocurre un error', async () => {
      repository.createQueryBuilder.mockImplementation(() => {
        throw new Error('fail');
      });

      const result = await service.findAll({ page: 1, limit: 10 } as any);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('debe buscar una imagen por id', async () => {
      const imagen = { id: '1' } as Imagen;
      repository.findOne.mockResolvedValue(imagen);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(imagen);
    });
  });

  describe('update', () => {
    it('debe actualizar una imagen existente', async () => {
      const existente = { id: '1', orden: 1 } as Imagen;
      const dto = { orden: 2 };
      repository.findOne.mockResolvedValue(existente);
      repository.save.mockResolvedValue({ ...existente, ...dto });

      const result = await service.update('1', dto as any);

      expect(repository.save).toHaveBeenCalledWith({ ...existente, ...dto });
      expect(result).toEqual({ ...existente, ...dto });
    });

    it('debe retornar null si la imagen no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe eliminar una imagen existente', async () => {
      const existente = { id: '1' } as Imagen;
      repository.findOne.mockResolvedValue(existente);
      repository.remove.mockResolvedValue(existente);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(existente);
      expect(result).toEqual(existente);
    });

    it('debe retornar null si la imagen no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
