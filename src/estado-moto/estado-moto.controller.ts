import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EstadoMotoService } from './estado-moto.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateEstadoMotoDto } from './dto/create-estado-moto.dto';
import { UpdateEstadoMotoDto } from './dto/update-estado-moto.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { EstadoMoto } from './estado-moto.entity';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('EstadoMoto')
@Controller('estado-moto')
export class EstadoMotoController {
  constructor(private readonly service: EstadoMotoService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo estado de moto (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Estado creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateEstadoMotoDto) {
    const estadoMoto = await this.service.create(dto);
    if (!estadoMoto) throw new InternalServerErrorException('Failed to create estado de moto');
    return new SuccessResponseDto('Estado de moto created successfully', estadoMoto);
  }

  @ApiOperation({ summary: 'Obtener todos los estados de moto con paginación y búsqueda' })
  @ApiResponse({ status: 200, description: 'Lista de estados de moto' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'nueva' })
  @ApiQuery({ name: 'sort', required: false, example: 'nombre' })
  @ApiQuery({ name: 'order', required: false, example: 'ASC' })
  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<EstadoMoto>>> {
    if (query.limit && query.limit > 100) query.limit = 100;
    const result = await this.service.findAll(query);
    if (!result) throw new InternalServerErrorException('Could not retrieve estados de moto');
    return new SuccessResponseDto('Estados de moto retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener un estado de moto por ID' })
  @ApiResponse({ status: 200, description: 'Estado encontrado' })
  @ApiResponse({ status: 404, description: 'Estado no encontrado' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const estadoMoto = await this.service.findOne(id);
    if (!estadoMoto) throw new NotFoundException('Estado de moto not found');
    return new SuccessResponseDto('Estado de moto retrieved successfully', estadoMoto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un estado de moto (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Estado no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEstadoMotoDto) {
    const estadoMoto = await this.service.update(id, dto);
    if (!estadoMoto) throw new NotFoundException('Estado de moto not found');
    return new SuccessResponseDto('Estado de moto updated successfully', estadoMoto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un estado de moto (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Estado eliminado' })
  @ApiResponse({ status: 404, description: 'Estado no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const estadoMoto = await this.service.remove(id);
    if (!estadoMoto) throw new NotFoundException('Estado de moto not found');
    return new SuccessResponseDto('Estado de moto deleted successfully', estadoMoto);
  }
}
