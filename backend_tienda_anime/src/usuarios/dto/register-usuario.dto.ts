import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUsuarioDto {
  @ApiProperty({ example: 'vendedor01', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  usuario: string;

  @ApiProperty({ writeOnly: true, minLength: 6, maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  clave: string;

  @ApiProperty({ example: 'Akira Tanaka', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombreCompleto: string;
}
