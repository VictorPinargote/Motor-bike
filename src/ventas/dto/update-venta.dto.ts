import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateVentaDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  precio_venta?: number;

  @IsOptional()
  @IsString()
  @IsIn(['efectivo', 'tarjeta', 'transferencia'])
  metodo_pago?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cuotas?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
