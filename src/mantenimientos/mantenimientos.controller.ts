import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, NotFoundException,
  InternalServerErrorException, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MantenimientosService } from './mantenimientos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Mantenimiento } from './mantenimiento.entity';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('mantenimientos')
@Controller('mantenimientos')
export class MantenimientosController {
  constructor(private readonly service: MantenimientosService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un mantenimiento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateMantenimientoDto) {
    const mantenimiento = await this.service.create(dto);
    if (!mantenimiento) {
      throw new InternalServerErrorException('Failed to create mantenimiento');
    }
    return new SuccessResponseDto('Mantenimiento created successfully', mantenimiento);
  }

  @ApiOperation({ summary: 'Listar mantenimientos' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'searchField', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false })
  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<Mantenimiento>>> {
    if (query.limit && query.limit > 100) {
      query.limit = 100;
    }

    const result = await this.service.findAll(query);

    if (!result) {
      throw new InternalServerErrorException('Could not retrieve mantenimientos');
    }

    return new SuccessResponseDto('Mantenimientos retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener un mantenimiento por id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const mantenimiento = await this.service.findOne(id);
    if (!mantenimiento) throw new NotFoundException('Mantenimiento not found');
    return new SuccessResponseDto('Mantenimiento retrieved successfully', mantenimiento);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un mantenimiento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMantenimientoDto) {
    const mantenimiento = await this.service.update(id, dto);
    if (!mantenimiento) throw new NotFoundException('Mantenimiento not found');
    return new SuccessResponseDto('Mantenimiento updated successfully', mantenimiento);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un mantenimiento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const mantenimiento = await this.service.remove(id);
    if (!mantenimiento) throw new NotFoundException('Mantenimiento not found');
    return new SuccessResponseDto('Mantenimiento deleted successfully', mantenimiento);
  }
}
