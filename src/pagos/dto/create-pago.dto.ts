import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePagoDto {
  @IsNotEmpty()
  @IsString()
  venta_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monto: number;

  @IsNotEmpty()
  @IsDateString()
  fecha_pago: string;

  @IsNotEmpty()
  @IsString()
  metodo_pago: string;
}
