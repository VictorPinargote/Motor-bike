import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ImagenesService } from './imagenes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Imagenes')
@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly service: ImagenesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subir una nueva imagen de moto (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Imagen registrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateImagenDto) {
    const imagen = await this.service.create(dto);
    if (!imagen) throw new InternalServerErrorException('Failed to create imagen');
    return new SuccessResponseDto('Imagen created successfully', imagen);
  }

  @ApiOperation({ summary: 'Obtener todas las imágenes con paginación y búsqueda' })
  @ApiResponse({ status: 200, description: 'Lista de imágenes' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'frontal' })
  @ApiQuery({ name: 'sort', required: false, example: 'orden' })
  @ApiQuery({ name: 'order', required: false, example: 'ASC' })
  @Get()
  async findAll(@Query() query: QueryDto) {
    if (query.limit && query.limit > 100) query.limit = 100;
    const result = await this.service.findAll(query);
    if (!result) throw new InternalServerErrorException('Could not retrieve imagenes');
    return new SuccessResponseDto('Imagenes retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener una imagen por ID' })
  @ApiResponse({ status: 200, description: 'Imagen encontrada' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const imagen = await this.service.findOne(id);
    if (!imagen) throw new NotFoundException('Imagen not found');
    return new SuccessResponseDto('Imagen retrieved successfully', imagen);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una imagen (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Imagen actualizada' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateImagenDto) {
    const imagen = await this.service.update(id, dto);
    if (!imagen) throw new NotFoundException('Imagen not found');
    return new SuccessResponseDto('Imagen updated successfully', imagen);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una imagen (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const imagen = await this.service.remove(id);
    if (!imagen) throw new NotFoundException('Imagen not found');
    return new SuccessResponseDto('Imagen deleted successfully', imagen);
  }
}
