import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateProductoDto {

    @IsString({ message: 'El código debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código no puede estar vacío.' })
  @MaxLength(30, { message: 'El código no puede tener más de 30 caracteres.' })
  codigo: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres.' })
    readonly nombre: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  readonly descripcion: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio de venta debe ser un número válido.' })
  @IsNotEmpty({ message: 'El precio de venta es obligatorio.' })
  @Min(0, { message: 'El precio de venta no puede ser negativo.' })
  readonly precio_venta: number;

  @IsInt({ message: 'El stock debe ser un número entero.' })
  @Min(0, { message: 'El stock no puede ser negativo.' })
  @IsOptional()
  readonly stock: number;

  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto.' })
  @IsOptional()
  @MaxLength(255, { message: 'La URL de la imagen no puede tener más de 255 caracteres.' })
  readonly imagen_url: string;

  @IsInt({ message: 'El ID de la categoría debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio.' })
  readonly categoria_id: number;

  @IsBoolean({ message: 'El estado debe ser verdadero o falso.' })
  @IsOptional()
  readonly estado: boolean;
}
