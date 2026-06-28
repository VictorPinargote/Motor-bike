import { IsNotEmpty, IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateVentaDto {
  @IsNotEmpty()
  @IsString()
  usuario_id: string;

  @IsNotEmpty()
  @IsString()
  moto_id: string;

  @IsNotEmpty()
  @IsNumber()
  precio_venta: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['efectivo', 'tarjeta', 'transferencia'])
  metodo_pago: string;

  @IsOptional()
  @IsNumber()
  cuotas?: number;

  @IsNotEmpty()
  @IsString()
  estado: string;
}
