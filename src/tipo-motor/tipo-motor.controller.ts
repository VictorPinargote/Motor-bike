import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TipoMotorService } from './tipo-motor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateTipoMotorDto } from './dto/create-tipo-motor.dto';
import { UpdateTipoMotorDto } from './dto/update-tipo-motor.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { TipoMotor } from './tipo-motor.entity';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@ApiTags('Tipo Motor')
@Controller('tipo-motor')
export class TipoMotorController {
  constructor(private readonly service: TipoMotorService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo tipo de motor (Solo ADMIN)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateTipoMotorDto) {
    const tipoMotor = await this.service.create(dto);
    if (!tipoMotor) throw new InternalServerErrorException('Failed to create tipo de motor');
    return new SuccessResponseDto('Tipo de motor created successfully', tipoMotor);
  }

  @ApiOperation({ summary: 'Obtener todos los tipos de motor con paginación y búsqueda' })
  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<TipoMotor>>> {
    if (query.limit && query.limit > 100) {
      query.limit = 100;
    }

    const result = await this.service.findAll(query);

    if (!result) throw new InternalServerErrorException('Could not retrieve tipos de motor');

    return new SuccessResponseDto('Tipos de motor retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener un tipo de motor por ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tipoMotor = await this.service.findOne(id);
    if (!tipoMotor) throw new NotFoundException('Tipo de motor not found');
    return new SuccessResponseDto('Tipo de motor retrieved successfully', tipoMotor);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un tipo de motor (Solo ADMIN)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTipoMotorDto) {
    const tipoMotor = await this.service.update(id, dto);
    if (!tipoMotor) throw new NotFoundException('Tipo de motor not found');
    return new SuccessResponseDto('Tipo de motor updated successfully', tipoMotor);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un tipo de motor (Solo ADMIN)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const tipoMotor = await this.service.remove(id);
    if (!tipoMotor) throw new NotFoundException('Tipo de motor not found');
    return new SuccessResponseDto('Tipo de motor deleted successfully', tipoMotor);
  }
}