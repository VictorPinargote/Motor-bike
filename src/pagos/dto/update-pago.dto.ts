import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePagoDto {
  @IsOptional()
  @IsString()
  venta_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monto?: number;

  @IsOptional()
  @IsDateString()
  fecha_pago?: string;

  @IsOptional()
  @IsString()
  metodo_pago?: string;
}
