import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateImagenDto {
  @IsOptional()
  @IsString()
  moto_id?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  orden?: number;
}
