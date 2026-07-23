import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarcasService } from './marcas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Marca } from './marca.entity';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Marcas')
@Controller('marcas')
export class MarcasController {
  constructor(private readonly service: MarcasService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva marca (Solo ADMIN)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateMarcaDto) {
    const marca = await this.service.create(dto);
    if (!marca) throw new InternalServerErrorException('Failed to create marca');
    return new SuccessResponseDto('Marca created successfully', marca);
  }

  @ApiOperation({ summary: 'Obtener todas las marcas con paginación y búsqueda' })
  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<Marca>>> {
    if (query.limit && query.limit > 100) {
      query.limit = 100;
    }

    const result = await this.service.findAll(query);

    if (!result) throw new InternalServerErrorException('Could not retrieve marcas');

    return new SuccessResponseDto('Marcas retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener una marca por ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const marca = await this.service.findOne(id);
    if (!marca) throw new NotFoundException('Marca not found');
    return new SuccessResponseDto('Marca retrieved successfully', marca);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una marca (Solo ADMIN)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMarcaDto) {
    const marca = await this.service.update(id, dto);
    if (!marca) throw new NotFoundException('Marca not found');
    return new SuccessResponseDto('Marca updated successfully', marca);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una marca (Solo ADMIN)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const marca = await this.service.remove(id);
    if (!marca) throw new NotFoundException('Marca not found');
    return new SuccessResponseDto('Marca deleted successfully', marca);
  }
}