import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReservasService } from './reservas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Reserva } from './reserva.entity';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Reservas')
@Controller('reservas')
export class ReservasController {
  constructor(private readonly service: ReservasService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva reserva (cualquier usuario logueado)' })
  @ApiResponse({ status: 201, description: 'Reserva creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateReservaDto) {
    const reserva = await this.service.create(dto);
    if (!reserva) throw new InternalServerErrorException('Failed to create reserva');
    return new SuccessResponseDto('Reserva created successfully', reserva);
  }

  @ApiOperation({ summary: 'Obtener todas las reservas con paginación, búsqueda y ordenamiento' })
  @ApiResponse({ status: 200, description: 'Lista de reservas' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'activa' })
  @ApiQuery({ name: 'sort', required: false, example: 'fecha_reserva' })
  @ApiQuery({ name: 'order', required: false, example: 'DESC' })
  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<Reserva>>> {
    if (query.limit && query.limit > 100) {
      query.limit = 100;
    }

    const result = await this.service.findAll(query);

    if (!result) throw new InternalServerErrorException('Could not retrieve reservas');

    return new SuccessResponseDto('Reservas retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiResponse({ status: 200, description: 'Reserva encontrada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reserva = await this.service.findOne(id);
    if (!reserva) throw new NotFoundException('Reserva not found');
    return new SuccessResponseDto('Reserva retrieved successfully', reserva);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una reserva (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Reserva actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateReservaDto) {
    const reserva = await this.service.update(id, dto);
    if (!reserva) throw new NotFoundException('Reserva not found');
    return new SuccessResponseDto('Reserva updated successfully', reserva);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una reserva (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Reserva eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const reserva = await this.service.remove(id);
    if (!reserva) throw new NotFoundException('Reserva not found');
    return new SuccessResponseDto('Reserva deleted successfully', reserva);
  }
}
