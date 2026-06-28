import { IsOptional, IsString } from 'class-validator';

export class UpdateTipoMotorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
