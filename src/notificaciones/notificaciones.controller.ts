import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';

@ApiTags('notificaciones')
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una notificación' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateNotificacionDto) {
    const notificacion = await this.notificacionesService.create(dto);
    if (!notificacion) {
      throw new InternalServerErrorException('Failed to create notification');
    }
    return new SuccessResponseDto('Notification created successfully', notificacion);
  }

  @ApiOperation({ summary: 'Listar notificaciones' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.notificacionesService.findAll({ page, limit, search });
    if (!result) {
      throw new InternalServerErrorException('Could not retrieve notifications');
    }
    return new SuccessResponseDto('Notifications retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener una notificación por id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const notificacion = await this.notificacionesService.findOne(id);
    if (!notificacion) {
      throw new NotFoundException('Notification not found');
    }
    return new SuccessResponseDto('Notification retrieved successfully', notificacion);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una notificación' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNotificacionDto) {
    const notificacion = await this.notificacionesService.update(id, dto);
    if (!notificacion) {
      throw new NotFoundException('Notification not found');
    }
    return new SuccessResponseDto('Notification updated successfully', notificacion);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const notificacion = await this.notificacionesService.remove(id);
    if (!notificacion) {
      throw new NotFoundException('Notification not found');
    }
    return new SuccessResponseDto('Notification deleted successfully', notificacion);
  }
}
