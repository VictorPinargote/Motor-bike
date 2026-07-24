import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un usuario y retornar la respuesta de éxito', async () => {
      const dto = { username: 'romeo', email: 'romeo@test.com', password: '123456' };
      const user = { id: '1', ...dto };
      service.create.mockResolvedValue(user as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, message: 'User created successfully', data: user });
    });
  });

  describe('findAll', () => {
    it('debe limitar el limit a 100 si excede el máximo', async () => {
      const query = { page: 1, limit: 500 };
      service.findAll.mockResolvedValue({ items: [], meta: {} } as any);

      await controller.findAll(query as any);

      expect(query.limit).toBe(100);
    });

    it('debe lanzar BadRequestException si isActive no es "true" ni "false"', async () => {
      await expect(controller.findAll({ page: 1, limit: 10 } as any, 'quizas')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe pasar isActive convertido a booleano al servicio', async () => {
      service.findAll.mockResolvedValue({ items: [], meta: {} } as any);

      await controller.findAll({ page: 1, limit: 10 } as any, 'true');

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, true);
    });

    it('debe lanzar InternalServerErrorException si el servicio retorna null', async () => {
      service.findAll.mockResolvedValue(null);

      await expect(controller.findAll({ page: 1, limit: 10 } as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('debe retornar un usuario existente', async () => {
      const user = { id: '1' };
      service.findOne.mockResolvedValue(user as any);

      const result = await controller.findOne('1');

      expect(result).toEqual({ success: true, message: 'User retrieved successfully', data: user });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un usuario existente', async () => {
      const user = { id: '1' };
      service.remove.mockResolvedValue(user as any);

      const result = await controller.remove('1');

      expect(result).toEqual({ success: true, message: 'User deleted successfully', data: user });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.remove.mockResolvedValue(null);

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadProfile', () => {
    it('debe lanzar BadRequestException si no se envía archivo', async () => {
      await expect(controller.uploadProfile('1', undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('debe actualizar la imagen de perfil correctamente', async () => {
      const file = { filename: 'foto.png' } as Express.Multer.File;
      const user = { id: '1', profile: 'foto.png' };
      service.updateProfile.mockResolvedValue(user as any);

      const result = await controller.uploadProfile('1', file);

      expect(service.updateProfile).toHaveBeenCalledWith('1', 'foto.png');
      expect(result).toEqual({ success: true, message: 'Profile image updated', data: user });
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const file = { filename: 'foto.png' } as Express.Multer.File;
      service.updateProfile.mockResolvedValue(null);

      await expect(controller.uploadProfile('99', file)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un usuario existente', async () => {
      const dto = { nombre: 'Romeo' };
      const user = { id: '1', ...dto };
      service.update.mockResolvedValue(user as any);

      const result = await controller.update('1', dto as any);

      expect(result).toEqual({ success: true, message: 'User updated successfully', data: user });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update('99', {} as any)).rejects.toThrow(NotFoundException);
    });
  });
});
