import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateMantenimientoDto {
  @IsOptional()
  @IsString()
  moto_id?: string;

  @IsOptional()
  @IsString()
  usuario_id?: string;

  @IsOptional()
  @IsDateString()
  fecha?: Date;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;
}
