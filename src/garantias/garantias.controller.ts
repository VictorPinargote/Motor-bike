import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { GarantiasService } from './garantias.service';
import { CreateGarantiaDto } from './dto/create-garantia.dto';
import { UpdateGarantiaDto } from './dto/update-garantia.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { QueryDto } from '../common/dto/query.dto';

@ApiTags('Garantias')
@Controller('garantias')
export class GarantiasController {
  constructor(private readonly garantiasService: GarantiasService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva garantía (Solo ADMIN)' })
  @Post()
  create(@Body() createGarantiaDto: CreateGarantiaDto) {
    return this.garantiasService.create(createGarantiaDto);
  }

  @ApiOperation({ summary: 'Obtener todas las garantías con paginación y búsqueda' })
  @Get()
  findAll(@Query() query: QueryDto) {
    return this.garantiasService.findAll(query);
  }

  @ApiOperation({ summary: 'Obtener una garantía por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.garantiasService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una garantía (Solo ADMIN)' })
  @Patch(':id') // 👈 Usando PATCH en lugar de PUT
  update(@Param('id') id: string, @Body() updateGarantiaDto: UpdateGarantiaDto) {
    return this.garantiasService.update(+id, updateGarantiaDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una garantía (Solo ADMIN)' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.garantiasService.remove(+id);
  }
}