import { Module } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './reserva.entity';
import { Carrito } from '../carrito/carrito.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Carrito])],
  controllers: [ReservasController],
  providers: [ReservasService]
})
export class ReservasModule {}
