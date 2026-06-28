import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { SuccessResponseDto } from '../common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { User } from './user.entity';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { QueryDto } from '../common/dto/query.dto';
import { UserRole } from './user-role.enum';

interface AuthenticatedRequest {
  user: {
    id: string;
    role: UserRole;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    if (!user) throw new InternalServerErrorException('Could not create user');
    return new SuccessResponseDto(
      'User created successfully',
      this.usersService.sanitizeUser(user),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll(
    @Query() query: QueryDto,
    @Query('isActive') isActive?: string,
  ): Promise<SuccessResponseDto<Pagination<Omit<User, 'password'>>>> {
    if (query.limit && query.limit > 100) {
      query.limit = 100;
    }

    if (isActive !== undefined && !['true', 'false'].includes(isActive)) {
      throw new BadRequestException(
        'Invalid value for "isActive". Use true or false.',
      );
    }

    const activeFilter =
      isActive === undefined ? undefined : isActive === 'true';

    const result = await this.usersService.findAll(query, activeFilter);

    if (!result) {
      throw new InternalServerErrorException('Could not retrieve users');
    }

    return new SuccessResponseDto(
      'Users retrieved successfully',
      this.usersService.sanitizeUsersPagination(result),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('You can only access your own user');
    }

    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto(
      'User retrieved successfully',
      this.usersService.sanitizeUser(user),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto(
      'User deleted successfully',
      this.usersService.sanitizeUser(user),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile/:id')
  @UseInterceptors(
    FileInterceptor('profile', {
      storage: diskStorage({
        destination: './public/profile',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException('Only JPG or PNG files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('You can only update your own profile image');
    }

    if (!file) throw new BadRequestException('Profile image is required');

    const user = await this.usersService.updateProfile(id, file.filename);

    if (!user) throw new NotFoundException('User not found');

    return new SuccessResponseDto(
      'Profile image updated',
      this.usersService.sanitizeUser(user),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isAdmin && req.user.id !== id) {
      throw new ForbiddenException('You can only update your own user');
    }

    if (!isAdmin) {
      delete dto.role;
      delete dto.isActive;
    }

    const user = await this.usersService.update(id, dto);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto(
      'User updated successfully',
      this.usersService.sanitizeUser(user),
    );
  }
}
