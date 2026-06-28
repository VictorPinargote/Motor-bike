import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNotificacionDto {
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  mensaje?: string;

  @IsOptional()
  @IsBoolean()
  leida?: boolean;
}
