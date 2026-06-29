import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from './color.entity';
import { ColoresService } from './colores.service';
import { ColoresController } from './colores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Color])],
  controllers: [ColoresController],
  providers: [ColoresService],
})
export class ColoresModule {}
