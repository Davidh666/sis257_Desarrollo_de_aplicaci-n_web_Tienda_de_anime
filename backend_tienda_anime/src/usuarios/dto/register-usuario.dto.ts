import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
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

  @ApiProperty({ required: false, example: '1234567890', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nitCi?: string;

  @ApiProperty({ required: false, example: '+59170000000', maxLength: 15 })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  telefono?: string;

  @ApiProperty({ required: false, example: 'cliente@example.com', maxLength: 100 })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;
}
