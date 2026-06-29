import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateColorDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  codigo_hex?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
