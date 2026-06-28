import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseGuards
} from '@nestjs/common';
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

@Controller('ventas')
export class VentasController {
  constructor(private readonly service: VentasService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateVentaDto) {
    const venta = await this.service.create(dto);
    if (!venta) throw new InternalServerErrorException('Failed to create venta');
    return new SuccessResponseDto('Venta created successfully', venta);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query() query: QueryDto,
  ): Promise<SuccessResponseDto<Pagination<Venta>>> {
    if (query.limit && query.limit > 100) {
      query.limit = 100;
    }

    const result = await this.service.findAll(query);

    if (!result) throw new InternalServerErrorException('Could not retrieve ventas');

    return new SuccessResponseDto('Ventas retrieved successfully', result);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const venta = await this.service.findOne(id);
    if (!venta) throw new NotFoundException('Venta not found');
    return new SuccessResponseDto('Venta retrieved successfully', venta);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVentaDto) {
    const venta = await this.service.update(id, dto);
    if (!venta) throw new NotFoundException('Venta not found');
    return new SuccessResponseDto('Venta updated successfully', venta);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const venta = await this.service.remove(id);
    if (!venta) throw new NotFoundException('Venta not found');
    return new SuccessResponseDto('Venta deleted successfully', venta);
  }
}
