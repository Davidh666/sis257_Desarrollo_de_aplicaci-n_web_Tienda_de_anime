import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClienteDto {
    @ApiProperty({ example: 'Akiba Store SRL', maxLength: 100 })
    @IsString({ message: 'La razón social debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La razón social no puede estar vacía' })
    @MaxLength(100, { message: 'La razón social no puede exceder los 100 caracteres' })
    readonly razonSocial: string;

    @ApiProperty({ example: '1234567890', maxLength: 20 })
    @IsString({ message: 'El NIT/CI debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El NIT/CI es obligatorio' })
    @MaxLength(20, { message: 'El NIT/CI no puede exceder los 20 caracteres' })
    readonly nitCi: string;

    @ApiPropertyOptional({ example: '70000000', maxLength: 15 })
    @IsString()
    @IsOptional()
    @MaxLength(15, { message: 'El teléfono no puede exceder los 15 caracteres' })
    readonly telefono?: string;

    @ApiPropertyOptional({ example: 'cliente@example.com' })
    @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
    @IsOptional()
    @MaxLength(100)
    readonly email?: string;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
        readonly estado: boolean;    

}
