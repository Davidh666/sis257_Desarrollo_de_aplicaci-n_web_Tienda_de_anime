import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVentaDto {
  @ApiPropertyOptional({ enum: ['COMPLETADA', 'ANULADA'] })
  @IsOptional()
  @IsIn(['COMPLETADA', 'ANULADA'])
  estado?: 'COMPLETADA' | 'ANULADA';
}
