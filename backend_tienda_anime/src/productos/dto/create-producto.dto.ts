import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductoDto {

  @ApiProperty({ example: 'FIG-001', maxLength: 30 })
  @IsString({ message: 'El código debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código no puede estar vacío.' })
  @MaxLength(30, { message: 'El código no puede tener más de 30 caracteres.' })
  codigo: string;

  @ApiProperty({ example: 'Figura de colección', maxLength: 100 })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres.' })
    readonly nombre: string;

  @ApiPropertyOptional({ example: 'Edición coleccionista.' })
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  readonly descripcion: string;

  @ApiProperty({ example: 150.5, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio de venta debe ser un número válido.' })
  @IsNotEmpty({ message: 'El precio de venta es obligatorio.' })
  @Min(0, { message: 'El precio de venta no puede ser negativo.' })
  readonly precioVenta: number;

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsInt({ message: 'El stock debe ser un número entero.' })
  @Min(0, { message: 'El stock no puede ser negativo.' })
  @IsOptional()
  readonly stock: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg', maxLength: 255 })
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto.' })
  @IsOptional()
  @MaxLength(255, { message: 'La URL de la imagen no puede tener más de 255 caracteres.' })
  readonly imagenUrl: string;

  @ApiProperty({ example: 2, description: 'ID de una categoría activa.' })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio.' })
  readonly categoriaId: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean({ message: 'El estado debe ser verdadero o falso.' })
  @IsOptional()
  readonly estado: boolean;
}
