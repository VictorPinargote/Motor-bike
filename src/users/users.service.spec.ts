import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt',()=>({hash:jest.fn()}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Partial<Record<keyof Repository<User>, jest.Mock>>;

  const user: User = {
    id: 'user-1',
    username: 'cliente',
    email: 'cliente@example.com',
    password: 'hashed-password',
    nombre: 'Cliente',
    apellido: 'Test',
    role: UserRole.USER,
    isActive: true,
    profile: '',
  };

  beforeEach(() => {
    repository = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ id: 'user-1', ...data })),
      findOne: jest.fn(),
      remove: jest.fn(async (data) => data),
      createQueryBuilder: jest.fn(),
    };
    service = new UsersService(repository as unknown as Repository<User>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hashes the password and defaults role to USER when creating a user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const result = await service.create({
      username: 'cliente',
      email: 'cliente@example.com',
      password: 'User12345',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('User12345', 10);
    expect(repository.create).toHaveBeenCalledWith({
      username: 'cliente',
      email: 'cliente@example.com',
      password: 'hashed-password',
      role: UserRole.USER,
    });
    expect(result).toEqual({
      id: 'user-1',
      username: 'cliente',
      email: 'cliente@example.com',
      password: 'hashed-password',
      role: UserRole.USER,
    });
  });

  it('preserves the provided role when creating an admin user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    await service.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin12345',
      role: UserRole.ADMIN,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.ADMIN }),
    );
  });

  it('finds a user by id', async () => {
    repository.findOne!.mockResolvedValue(user);

    await expect(service.findOne('user-1')).resolves.toBe(user);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
  });

  it('finds a user by username', async () => {
    repository.findOne!.mockResolvedValue(user);

    await expect(service.findByUsername('cliente')).resolves.toBe(user);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { username: 'cliente' },
    });
  });

  it('hashes a new password when updating a user', async () => {
    repository.findOne!.mockResolvedValue({ ...user });
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

    const result = await service.update('user-1', {
      password: 'NewPass123',
      nombre: 'Actualizado',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('NewPass123', 10);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        password: 'new-hash',
        nombre: 'Actualizado',
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'user-1',
        password: 'new-hash',
        nombre: 'Actualizado',
      }),
    );
  });

  it('returns null when updating a missing user', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.update('missing', { nombre: 'Nada' })).resolves.toBeNull();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes an existing user', async () => {
    repository.findOne!.mockResolvedValue(user);
    repository.remove!.mockResolvedValue(user);

    await expect(service.remove('user-1')).resolves.toBe(user);
    expect(repository.remove).toHaveBeenCalledWith(user);
  });

  it('updates profile image filename', async () => {
    repository.findOne!.mockResolvedValue({ ...user });

    const result = await service.updateProfile('user-1', 'profile.png');

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ profile: 'profile.png' }),
    );
    expect(result).toEqual(expect.objectContaining({ profile: 'profile.png' }));
  });
});
