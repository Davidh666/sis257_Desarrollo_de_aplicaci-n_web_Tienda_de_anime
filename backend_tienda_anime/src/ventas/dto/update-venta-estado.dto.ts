import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateVentaEstadoDto {
  @ApiProperty({ enum: ['APROBADO', 'RECHAZADO'] })
  @IsIn(['APROBADO', 'RECHAZADO'])
  estado: 'APROBADO' | 'RECHAZADO';
}
