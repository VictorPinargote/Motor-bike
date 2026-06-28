import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReservaDto {
  @IsNotEmpty()
  @IsUUID()
  usuario_id: string;

  @IsNotEmpty()
  @IsUUID()
  moto_id: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fecha_reserva: Date;

  @IsNotEmpty()
  @IsString()
  estado: string;
}
