import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Imagen } from './imagen.entity';
import { ImagenesService } from './imagenes.service';
import { ImagenesController } from './imagenes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Imagen])],
  controllers: [ImagenesController],
  providers: [ImagenesService],
})
export class ImagenesModule {}
