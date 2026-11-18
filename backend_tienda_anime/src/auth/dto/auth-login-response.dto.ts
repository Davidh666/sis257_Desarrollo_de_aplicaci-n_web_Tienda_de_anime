import { ApiProperty } from '@nestjs/swagger';
import type { UserRole } from '../interfaces/user-role.interface';

export class AuthLoginResponseDto {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({ example: 'vendedor01' })
  usuario: string;

  @ApiProperty({ example: 'Akira Tanaka' })
  nombreCompleto: string;

  @ApiProperty({ enum: ['ADMINISTRADOR', 'VENDEDOR', 'CLIENTE'] })
  rol: UserRole;

  @ApiProperty({ example: true })
  estado: boolean;

  @ApiProperty({
    description: 'JWT Bearer para las rutas protegidas.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}
