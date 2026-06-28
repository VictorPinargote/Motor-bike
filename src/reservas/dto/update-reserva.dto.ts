import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateReservaDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha_reserva?: Date;

  @IsOptional()
  @IsString()
  estado?: string;
}
