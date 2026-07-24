import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Venta } from './venta.entity';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly service: VentasService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar una nueva venta (AUTH)' })
  @ApiResponse({ status: 201, description: 'Venta registrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateVentaDto) {
    const venta = await this.service.create(dto);
    if (!venta) throw new InternalServerErrorException('Failed to create venta');
    return new SuccessResponseDto('Venta created successfully', venta);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las ventas con paginación y búsqueda' })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false, example: 'ASC' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<Venta>>> {
    if (query.limit && query.limit > 100) query.limit = 100;
    const result = await this.service.findAll(query);
    if (!result) throw new InternalServerErrorException('Could not retrieve ventas');
    return new SuccessResponseDto('Ventas retrieved successfully', result);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const venta = await this.service.findOne(id);
    if (!venta) throw new NotFoundException('Venta not found');
    return new SuccessResponseDto('Venta retrieved successfully', venta);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una venta (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Venta actualizada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVentaDto) {
    const venta = await this.service.update(id, dto);
    if (!venta) throw new NotFoundException('Venta not found');
    return new SuccessResponseDto('Venta updated successfully', venta);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una venta (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Venta eliminada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const venta = await this.service.remove(id);
    if (!venta) throw new NotFoundException('Venta not found');
    return new SuccessResponseDto('Venta deleted successfully', venta);
  }
}
