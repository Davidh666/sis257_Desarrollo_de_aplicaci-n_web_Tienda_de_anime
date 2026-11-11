import { Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class CreateDetalleVentaDto {
  @IsNumber({}, { message: 'El ID de la venta debe ser un número' })
  @IsNotEmpty({ message: 'La venta es obligatoria' })
  @Expose({ name: 'venta_id' })
  ventaId: number;

  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  @IsNotEmpty({ message: 'El producto es obligatorio' })
  @Expose({ name: 'producto_id' })
  productoId: number;

  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio unitario debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El precio unitario debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
  @Expose({ name: 'precio_unitario' })
  precioUnitario: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El subtotal debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El subtotal debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El subtotal es obligatorio' })
  subtotal: number;
}
