import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateClientePerfilDto {
  @ApiProperty({ example: 'Akira Tanaka', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombreCompleto: string;

  @ApiProperty({ example: '1234567890', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nitCi: string;

  @ApiPropertyOptional({ example: '+59170000000', maxLength: 15 })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  telefono?: string;

  @ApiPropertyOptional({ example: 'cliente@example.com', maxLength: 100 })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;
}
