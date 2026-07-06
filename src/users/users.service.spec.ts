import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as paginateModule from 'nestjs-typeorm-paginate';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';

jest.mock('bcrypt');
jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
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

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe hashear la contraseña, asignar rol USER por defecto y guardar', async () => {
      const dto = { username: 'romeo', email: 'romeo@test.com', password: '123456' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      const userCreado = { id: '1', ...dto, password: 'hashed_password', role: UserRole.USER };
      repository.create.mockReturnValue(userCreado as User);
      repository.save.mockResolvedValue(userCreado as User);

      const result = await service.create(dto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        role: UserRole.USER,
        password: 'hashed_password',
      });
      expect(result).toEqual(userCreado);
    });

    it('debe retornar null si ocurre un error', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('hash error'));

      const result = await service.create({ password: '123' } as any);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debe filtrar por username cuando searchField es username', async () => {
      const queryDto = { page: 1, limit: 10, search: 'romeo', searchField: 'username' };
      (paginateModule.paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

      await service.findAll(queryDto as any);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.username ILIKE :search', { search: '%romeo%' });
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
    it('debe buscar un usuario por id', async () => {
      const user = { id: '1' } as User;
      repository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(user);
    });

    it('debe retornar null si ocurre un error', async () => {
      repository.findOne.mockRejectedValue(new Error('fail'));

      const result = await service.findOne('1');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('debe buscar un usuario por username', async () => {
      const user = { id: '1', username: 'romeo' } as User;
      repository.findOne.mockResolvedValue(user);

      const result = await service.findByUsername('romeo');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { username: 'romeo' } });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('debe actualizar un usuario y re-hashear la contraseña si viene en el dto', async () => {
      const existente = { id: '1', username: 'romeo', password: 'old_hash' } as User;
      repository.findOne.mockResolvedValue(existente);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');
      repository.save.mockImplementation(async (u: any) => u);

      const result = await service.update('1', { password: 'nueva' } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('nueva', 10);
      expect(result).toEqual({ ...existente, password: 'new_hash' });
    });

    it('debe retornar null si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.update('99', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar un usuario existente', async () => {
      const existente = { id: '1' } as User;
      repository.findOne.mockResolvedValue(existente);
      repository.remove.mockResolvedValue(existente);

      const result = await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(existente);
      expect(result).toEqual(existente);
    });

    it('debe retornar null si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.remove('99');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('debe actualizar la imagen de perfil de un usuario existente', async () => {
      const existente = { id: '1', profile: null } as any as User;
      repository.findOne.mockResolvedValue(existente);
      repository.save.mockImplementation(async (u: any) => u);

      const result = await service.updateProfile('1', 'foto.png');

      expect(result).toEqual({ ...existente, profile: 'foto.png' });
    });

    it('debe retornar null si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.updateProfile('99', 'foto.png');

      expect(result).toBeNull();
    });
  });
});
