import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateDetalleVentaDto {
  @ApiProperty({ example: 25 })
  @IsNumber({}, { message: 'El ID de la venta debe ser un número' })
  @IsNotEmpty({ message: 'La venta es obligatoria' })
  ventaId: number;

  @ApiProperty({ example: 12 })
  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  @IsNotEmpty({ message: 'El producto es obligatorio' })
  productoId: number;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  cantidad: number;

  @ApiProperty({ example: 150.5, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio unitario debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El precio unitario debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
  precioUnitario: number;

  @ApiProperty({ example: 301, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El subtotal debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El subtotal debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El subtotal es obligatorio' })
  subtotal: number;
}
