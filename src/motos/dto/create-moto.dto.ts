import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateMotoDto {
  @IsNotEmpty()
  @IsString()
  modelo: string;

  @IsOptional()
  @IsUUID()
  marca_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  cilindraje?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsUUID()
  categoria_id?: string;

  @IsOptional()
  @IsUUID()
  tipo_motor_id?: string;

  @IsOptional()
  @IsUUID()
  estado_id?: string;

  @IsOptional()
  @IsUUID()
  color_id?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  imagen_url?: string;
}
