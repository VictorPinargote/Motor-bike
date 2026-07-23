import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCarritoDto {
  @IsNotEmpty()
  @IsUUID()
  usuario_id: string;

  @IsNotEmpty()
  @IsUUID()
  moto_id: string;
}
