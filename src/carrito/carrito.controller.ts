import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, Req, NotFoundException, InternalServerErrorException
} from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
    role: string;
  };
}

@Controller('carrito')
@UseGuards(JwtAuthGuard)
export class CarritoController {
  constructor(private readonly service: CarritoService) {}

  @Post()
  async add(@Body() dto: CreateCarritoDto) {
    const item = await this.service.create(dto);
    if (!item) throw new InternalServerErrorException('Failed to add to cart');
    return new SuccessResponseDto('Item added to cart successfully', item);
  }

  @Get('usuario/:usuario_id')
  async getByUser(@Param('usuario_id') usuario_id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'ADMIN' && req.user.id !== usuario_id) {
      throw new NotFoundException('Not authorized to access this cart');
    }
    const items = await this.service.findByUser(usuario_id);
    return new SuccessResponseDto('Cart retrieved successfully', items);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const item = await this.service.remove(id);
    if (!item) throw new NotFoundException('Cart item not found');
    return new SuccessResponseDto('Item removed from cart successfully', item);
  }

  @Delete('usuario/:usuario_id/moto/:moto_id')
  async removeByMotoAndUser(
    @Param('usuario_id') usuario_id: string,
    @Param('moto_id') moto_id: string,
    @Req() req: AuthenticatedRequest
  ) {
    if (req.user.role !== 'ADMIN' && req.user.id !== usuario_id) {
      throw new NotFoundException('Not authorized');
    }
    const item = await this.service.removeByMotoAndUser(usuario_id, moto_id);
    if (!item) throw new NotFoundException('Cart item not found');
    return new SuccessResponseDto('Item removed from cart successfully', item);
  }

  @Delete('usuario/:usuario_id/clear')
  async clear(@Param('usuario_id') usuario_id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'ADMIN' && req.user.id !== usuario_id) {
      throw new NotFoundException('Not authorized');
    }
    await this.service.clearUserCart(usuario_id);
    return new SuccessResponseDto('Cart cleared successfully', null);
  }
}
