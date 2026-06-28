import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificacionDto {
  @IsNotEmpty()
  @IsString()
  usuarioId: string;

  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  mensaje: string;

  @IsOptional()
  @IsBoolean()
  leida?: boolean;
}
