import { IsOptional, IsString } from 'class-validator';

export class UpdateColorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  codigo_hex?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
