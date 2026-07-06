import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user-role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt',()=>({compare:jest.fn()}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Pick<UsersService, 'findByUsername' | 'create'>;
  let jwtService: Pick<JwtService, 'sign'>;

  const user = {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'hashed-password',
    role: UserRole.ADMIN,
    nombre: 'Admin',
    apellido: 'Test',
    isActive: true,
    profile: null,
  };

  beforeEach(() => {
    usersService = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };
    service = new AuthService(usersService as UsersService, jwtService as JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a JWT when login credentials are valid', async () => {
    jest.spyOn(usersService, 'findByUsername').mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const token = await service.login({
      username: 'admin',
      password: 'Admin12345',
    });

    expect(token).toBe('signed-token');
    expect(usersService.findByUsername).toHaveBeenCalledWith('admin');
    expect(jwtService.sign).toHaveBeenCalledWith({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  });

  it('returns null when the user does not exist', async () => {
    jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);

    await expect(
      service.login({ username: 'missing', password: 'Admin12345' }),
    ).resolves.toBeNull();

    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('returns null when the password is invalid', async () => {
    jest.spyOn(usersService, 'findByUsername').mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ username: 'admin', password: 'wrong-password' }),
    ).resolves.toBeNull();

    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('creates a user and signs the registration token', async () => {
    jest.spyOn(usersService, 'create').mockResolvedValue(user as any);

    const token = await service.register({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin12345',
      role: UserRole.ADMIN,
    });

    expect(token).toBe('signed-token');
    expect(usersService.create).toHaveBeenCalledWith({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin12345',
      role: UserRole.ADMIN,
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  });

  it('returns null when registration fails', async () => {
    jest.spyOn(usersService, 'create').mockResolvedValue(null);

    await expect(
      service.register({
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin12345',
      }),
    ).resolves.toBeNull();
  });
});
