import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateVentaItemDto } from './create-venta.dto';

export class CreatePedidoDto {
  @ApiProperty({
    type: () => CreateVentaItemDto,
    isArray: true,
    description: 'Productos y cantidades solicitados por el cliente.',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'El pedido debe incluir al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateVentaItemDto)
  items: CreateVentaItemDto[];
}
