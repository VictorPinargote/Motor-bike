import { Module } from '@nestjs/common';
import { MotosController } from './motos.controller';
import { MotosService } from './motos.service';

@Module({
  controllers: [MotosController],
  providers: [MotosService]
})
export class MotosModule {}
