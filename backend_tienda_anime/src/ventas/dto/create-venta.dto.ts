import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class CreateVentaItemDto {
  @ApiProperty({ example: 12, description: 'ID del producto.' })
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsPositive()
  productoId: number;

  @ApiProperty({ example: 2, minimum: 1, description: 'Unidades solicitadas.' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero' })
  cantidad: number;
}

export class CreateVentaDto {
  @ApiProperty({ example: 3, description: 'ID del usuario con rol CLIENTE.' })
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  @IsPositive()
  @IsNotEmpty({ message: 'El cliente es obligatorio' })
  clienteId: number;

  @ApiProperty({
    type: () => CreateVentaItemDto,
    isArray: true,
    description: 'Productos y cantidades; los precios se resuelven en el servidor.',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'La venta debe incluir al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateVentaItemDto)
  items: CreateVentaItemDto[];
}
