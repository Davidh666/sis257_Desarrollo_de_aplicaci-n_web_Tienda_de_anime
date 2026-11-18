import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserRole } from '../../auth/interfaces/user-role.interface';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'vendedor01', maxLength: 50 })
  @IsString({ message: 'El campo usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MaxLength(50, { message: 'El usuario no puede tener más de 50 caracteres' })
  usuario: string;

  @ApiProperty({ writeOnly: true, minLength: 6, maxLength: 255 })
  @IsString({ message: 'La clave debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La clave es obligatoria' })
  @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres' })
  @MaxLength(255, { message: 'La clave no puede exceder los 255 caracteres' })
  clave: string;

  @ApiProperty({ example: 'Akira Tanaka', maxLength: 100 })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @MaxLength(100, { message: 'El nombre completo no puede tener más de 100 caracteres' })
  nombreCompleto: string;

  @ApiPropertyOptional({
    enum: ['ADMINISTRADOR', 'VENDEDOR', 'CLIENTE'],
    default: 'CLIENTE',
  })
  @IsOptional()
  @IsString({ message: 'El rol debe ser una cadena de texto' })
  @Matches(/^(ADMINISTRADOR|VENDEDOR|CLIENTE)$/, {
    message:
      'El rol debe ser exactamente "ADMINISTRADOR", "VENDEDOR" o "CLIENTE"',
  })
  rol: UserRole = 'CLIENTE';

  @ApiPropertyOptional({ example: true })
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @IsOptional()
  estado?: boolean;
}
