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
import { MensajesService } from './mensajes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';

@ApiTags('mensajes')
@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @ApiOperation({ summary: 'Crear un mensaje' })
  @Post()
  async create(@Body() dto: CreateMensajeDto) {
    const mensaje = await this.mensajesService.create(dto);
    if (!mensaje) {
      throw new InternalServerErrorException('Failed to create message');
    }
    return new SuccessResponseDto('Message sent successfully', mensaje);
  }

  @ApiOperation({ summary: 'Listar mensajes' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.mensajesService.findAll({ page, limit, search });
    if (!result) {
      throw new InternalServerErrorException('Could not retrieve messages');
    }
    return new SuccessResponseDto('Messages retrieved successfully', result);
  }

  @ApiOperation({ summary: 'Obtener un mensaje por id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const mensaje = await this.mensajesService.findOne(id);
    if (!mensaje) {
      throw new NotFoundException('Message not found');
    }
    return new SuccessResponseDto('Message retrieved successfully', mensaje);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un mensaje' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMensajeDto) {
    const mensaje = await this.mensajesService.update(id, dto);
    if (!mensaje) {
      throw new NotFoundException('Message not found');
    }
    return new SuccessResponseDto('Message updated successfully', mensaje);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un mensaje' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const mensaje = await this.mensajesService.remove(id);
    if (!mensaje) {
      throw new NotFoundException('Message not found');
    }
    return new SuccessResponseDto('Message deleted successfully', mensaje);
  }
}
