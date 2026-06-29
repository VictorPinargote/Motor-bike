import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query,
  NotFoundException, InternalServerErrorException,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Categoria } from './categories.entity';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Categorias')
@Controller('categorias')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva categoría (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateCategoriesDto) {
    const category = await this.service.create(dto);
    if (!category) throw new InternalServerErrorException('Failed to create category');
    return new SuccessResponseDto('Categoría creada correctamente', category);
  }

  @ApiOperation({ summary: 'Obtener todas las categorías con paginación y búsqueda' })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'deportiva' })
  @ApiQuery({ name: 'sort', required: false, example: 'nombre' })
  @ApiQuery({ name: 'order', required: false, example: 'ASC' })
  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<Categoria>>> {
    if (query.limit && query.limit > 100) query.limit = 100;
    const result = await this.service.findAll(query);
    if (!result) throw new InternalServerErrorException('Could not retrieve categories');
    return new SuccessResponseDto('Categorías obtenidas correctamente', result);
  }

  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.service.findOne(id);
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return new SuccessResponseDto('Categoría encontrada', category);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una categoría (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoriesDto) {
    const category = await this.service.update(id, dto);
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return new SuccessResponseDto('Categoría actualizada', category);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una categoría (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const category = await this.service.remove(id);
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return new SuccessResponseDto('Categoría eliminada', category);
  }
}
