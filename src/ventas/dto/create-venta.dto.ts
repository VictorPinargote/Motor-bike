import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateVentaDto {
  @IsNotEmpty()
  @IsUUID()
  usuario_id: string;

  @IsNotEmpty()
  @IsUUID()
  moto_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio_venta: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['efectivo', 'tarjeta', 'transferencia'])
  metodo_pago: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cuotas?: number;

  @IsNotEmpty()
  @IsString()
  estado: string;
}
