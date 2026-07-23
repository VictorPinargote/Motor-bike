import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, NotFoundException,
  InternalServerErrorException, UseGuards
} from '@nestjs/common';
import { MotosService } from './motos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMotoDto } from './dto/create-moto.dto';
import { UpdateMotoDto } from './dto/update-moto.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Moto } from './moto.entity';
import { QueryDto } from 'src/common/dto/query.dto';

@Controller('motos')
export class MotosController {
  constructor(private readonly service: MotosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateMotoDto) {
    const moto = await this.service.create(dto);
    if (!moto) throw new InternalServerErrorException('Failed to create moto');
    return new SuccessResponseDto('Moto created successfully', moto);
  }

  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<Moto>>> {
    if (query.limit && query.limit > 100) {
      query.limit = 100;
    }

    const result = await this.service.findAll(query);

    if (!result) throw new InternalServerErrorException('Could not retrieve motos');

    return new SuccessResponseDto('Motos retrieved successfully', result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const moto = await this.service.findOne(id);
    if (!moto) throw new NotFoundException('Moto not found');
    return new SuccessResponseDto('Moto retrieved successfully', moto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMotoDto) {
    const moto = await this.service.update(id, dto);
    if (!moto) throw new NotFoundException('Moto not found');
    return new SuccessResponseDto('Moto updated successfully', moto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const moto = await this.service.remove(id);
    if (!moto) throw new NotFoundException('Moto not found');
    return new SuccessResponseDto('Moto deleted successfully', moto);
  }
}
