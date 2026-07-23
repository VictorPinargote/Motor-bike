import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ColoresService } from './colores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Colores')
@Controller('colores')
export class ColoresController {
  constructor(private readonly service: ColoresService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo color (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Color creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateColorDto) {
    const color = await this.service.create(dto);
    if (!color) throw new InternalServerErrorException('Failed to create color');
    return new SuccessResponseDto('Color created successfully', color);
  }

  @ApiOperation({ summary: 'Obtener todos los colores con paginación y búsqueda' })
  @ApiResponse({ status: 200, description: 'Lista de colores' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'rojo' })
  @ApiQuery({ name: 'sort', required: false, example: 'nombre' })
  @ApiQuery({ name: 'order', required: false, example: 'ASC' })
  @Get()
  async findAll(@Query() query: QueryDto) {
    if (query.limit && query.limit > 100) query.limit = 100;
    const result = await this.service.findAll(query);
    if (!result) throw new InternalServerErrorException('Could not retrieve colores');
    return new SuccessResponseDto('Colores retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener un color por ID' })
  @ApiResponse({ status: 200, description: 'Color encontrado' })
  @ApiResponse({ status: 404, description: 'Color no encontrado' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const color = await this.service.findOne(id);
    if (!color) throw new NotFoundException('Color not found');
    return new SuccessResponseDto('Color retrieved successfully', color);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un color (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Color actualizado' })
  @ApiResponse({ status: 404, description: 'Color no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateColorDto) {
    const color = await this.service.update(id, dto);
    if (!color) throw new NotFoundException('Color not found');
    return new SuccessResponseDto('Color updated successfully', color);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un color (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Color eliminado' })
  @ApiResponse({ status: 404, description: 'Color no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const color = await this.service.remove(id);
    if (!color) throw new NotFoundException('Color not found');
    return new SuccessResponseDto('Color deleted successfully', color);
  }
}
