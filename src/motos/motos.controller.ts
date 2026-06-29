import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, NotFoundException,
  InternalServerErrorException, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MotosService } from './motos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMotoDto } from './dto/create-moto.dto';
import { UpdateMotoDto } from './dto/update-moto.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Moto } from './moto.entity';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Motos')
@Controller('motos')
export class MotosController {
  constructor(private readonly service: MotosService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva moto (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Moto creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateMotoDto) {
    const moto = await this.service.create(dto);
    if (!moto) throw new InternalServerErrorException('Failed to create moto');
    return new SuccessResponseDto('Moto created successfully', moto);
  }

  @ApiOperation({ summary: 'Obtener todas las motos con paginación, búsqueda y ordenamiento' })
  @ApiResponse({ status: 200, description: 'Lista de motos' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Honda' })
  @ApiQuery({ name: 'sort', required: false, example: 'modelo' })
  @ApiQuery({ name: 'order', required: false, example: 'ASC' })
  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<Moto>>> {
    if (query.limit && query.limit > 100) {
      query.limit = 100;
    }

    const result = await this.service.findAll(query);

    if (!result) throw new InternalServerErrorException('Could not retrieve motos');

    return new SuccessResponseDto('Motos retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener una moto por ID' })
  @ApiResponse({ status: 200, description: 'Moto encontrada' })
  @ApiResponse({ status: 404, description: 'Moto no encontrada' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const moto = await this.service.findOne(id);
    if (!moto) throw new NotFoundException('Moto not found');
    return new SuccessResponseDto('Moto retrieved successfully', moto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una moto (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Moto actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Moto no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMotoDto) {
    const moto = await this.service.update(id, dto);
    if (!moto) throw new NotFoundException('Moto not found');
    return new SuccessResponseDto('Moto updated successfully', moto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una moto (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Moto eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Moto no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const moto = await this.service.remove(id);
    if (!moto) throw new NotFoundException('Moto not found');
    return new SuccessResponseDto('Moto deleted successfully', moto);
  }
}
