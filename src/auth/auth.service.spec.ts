import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user-role.enum';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const usuario = {
    id: '1',
    username: 'romeo',
    email: 'romeo@test.com',
    password: 'hashed_password',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('debe retornar un token JWT cuando las credenciales son correctas', async () => {
      usersService.findByUsername.mockResolvedValue(usuario as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token-valido');

      const result = await service.login({ username: 'romeo', password: '123456' });

      expect(usersService.findByUsername).toHaveBeenCalledWith('romeo');
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', usuario.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: usuario.id,
        username: usuario.username,
        role: usuario.role,
      });
      expect(result).toBe('token-valido');
    });

    it('debe retornar null si el usuario no existe', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      const result = await service.login({ username: 'no_existe', password: '123456' });

      expect(result).toBeNull();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debe retornar null si la contraseña es incorrecta', async () => {
      usersService.findByUsername.mockResolvedValue(usuario as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login({ username: 'romeo', password: 'incorrecta' });

      expect(result).toBeNull();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debe retornar null si ocurre un error inesperado', async () => {
      usersService.findByUsername.mockRejectedValue(new Error('db error'));

      const result = await service.login({ username: 'romeo', password: '123456' });

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('debe crear el usuario y retornar un token JWT', async () => {
      const dto = { username: 'nuevo', email: 'nuevo@test.com', password: '123456' };
      usersService.create.mockResolvedValue(usuario as any);
      jwtService.sign.mockReturnValue('token-nuevo');

      const result = await service.register(dto as any);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: usuario.id,
        username: usuario.username,
        role: usuario.role,
      });
      expect(result).toBe('token-nuevo');
    });

    it('debe retornar null si no se pudo crear el usuario', async () => {
      usersService.create.mockResolvedValue(null);

      const result = await service.register({} as any);

      expect(result).toBeNull();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
