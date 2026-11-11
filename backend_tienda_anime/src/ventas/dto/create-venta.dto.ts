import { Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateVentaDto {
  @IsString({ message: 'El correlativo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El correlativo es obligatorio' })
  @MaxLength(20, { message: 'El correlativo no puede tener más de 20 caracteres' })
  correlativo: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El total debe ser un número válido' })
  @IsPositive({ message: 'El total debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El total es obligatorio' })
  total: number;

  @IsNumber({}, { message: 'El ID del cliente debe ser un número' })
  @IsNotEmpty({ message: 'El cliente es obligatorio' })
  @Expose({ name: 'cliente_id' })
  clienteId: number;

  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  @IsNotEmpty({ message: 'El usuario es obligatorio' })
  @Expose({ name: 'usuario_id' })
  usuarioId: number;

  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsOptional()
  estado?: string; // Por defecto se manejará como 'COMPLETADA' en la base de datos o entidad
}