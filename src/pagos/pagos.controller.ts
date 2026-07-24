import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly service: PagosService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un nuevo pago (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Pago registrado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreatePagoDto) {
    const pago = await this.service.create(dto);
    if (!pago) throw new InternalServerErrorException('Failed to create pago');
    return new SuccessResponseDto('Pago created successfully', pago);
  }

  @ApiOperation({ summary: 'Obtener todos los pagos con paginación y búsqueda' })
  @ApiResponse({ status: 200, description: 'Lista de pagos' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'efectivo' })
  @ApiQuery({ name: 'sort', required: false, example: 'fecha_pago' })
  @ApiQuery({ name: 'order', required: false, example: 'DESC' })
  @Get()
  async findAll(@Query() query: QueryDto) {
    if (query.limit && query.limit > 100) query.limit = 100;
    const result = await this.service.findAll(query);
    if (!result) throw new InternalServerErrorException('Could not retrieve pagos');
    return new SuccessResponseDto('Pagos retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener un pago por ID' })
  @ApiResponse({ status: 200, description: 'Pago encontrado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const pago = await this.service.findOne(id);
    if (!pago) throw new NotFoundException('Pago not found');
    return new SuccessResponseDto('Pago retrieved successfully', pago);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un pago (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Pago actualizado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePagoDto) {
    const pago = await this.service.update(id, dto);
    if (!pago) throw new NotFoundException('Pago not found');
    return new SuccessResponseDto('Pago updated successfully', pago);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un pago (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Pago eliminado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const pago = await this.service.remove(id);
    if (!pago) throw new NotFoundException('Pago not found');
    return new SuccessResponseDto('Pago deleted successfully', pago);
  }
}
