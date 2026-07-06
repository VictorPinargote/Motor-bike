import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('debe retornar el token cuando las credenciales son correctas', async () => {
      const dto = { username: 'romeo', password: '123456' };
      service.login.mockResolvedValue('token-valido');

      const result = await controller.login(dto);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        data: { access_token: 'token-valido' },
      });
    });

    it('debe lanzar UnauthorizedException con credenciales incorrectas', async () => {
      service.login.mockResolvedValue(null);

      await expect(
        controller.login({ username: 'romeo', password: 'mala' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('debe registrar un usuario y retornar el token', async () => {
      const dto = { username: 'nuevo', email: 'nuevo@test.com', password: '123456' };
      service.register.mockResolvedValue('token-nuevo');

      const result = await controller.register(dto as any);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        message: 'Registration successful',
        data: { access_token: 'token-nuevo' },
      });
    });

    it('debe lanzar BadRequestException si no se pudo registrar', async () => {
      service.register.mockResolvedValue(null);

      await expect(controller.register({} as any)).rejects.toThrow(BadRequestException);
    });
  });
});
