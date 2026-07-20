import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProveedoresService } from './proveedores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Proveedores')
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly service: ProveedoresService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo proveedor (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Proveedor creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateProveedorDto) {
    const proveedor = await this.service.create(dto);
    if (!proveedor) throw new InternalServerErrorException('Failed to create proveedor');
    return new SuccessResponseDto('Proveedor created successfully', proveedor);
  }

  @ApiOperation({ summary: 'Obtener todos los proveedores con paginación y búsqueda' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Yamaha' })
  @ApiQuery({ name: 'sort', required: false, example: 'nombre' })
  @ApiQuery({ name: 'order', required: false, example: 'ASC' })
  @Get()
  async findAll(@Query() query: QueryDto) {
    if (query.limit && query.limit > 100) query.limit = 100;
    const result = await this.service.findAll(query);
    if (!result) throw new InternalServerErrorException('Could not retrieve proveedores');
    return new SuccessResponseDto('Proveedores retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const proveedor = await this.service.findOne(id);
    if (!proveedor) throw new NotFoundException('Proveedor not found');
    return new SuccessResponseDto('Proveedor retrieved successfully', proveedor);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un proveedor (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProveedorDto) {
    const proveedor = await this.service.update(id, dto);
    if (!proveedor) throw new NotFoundException('Proveedor not found');
    return new SuccessResponseDto('Proveedor updated successfully', proveedor);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un proveedor (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const proveedor = await this.service.remove(id);
    if (!proveedor) throw new NotFoundException('Proveedor not found');
    return new SuccessResponseDto('Proveedor deleted successfully', proveedor);
  }
}
