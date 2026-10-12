import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateClienteDto {
    @IsString({ message: 'La razón social debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La razón social no puede estar vacía' })
    @MaxLength(100, { message: 'La razón social no puede exceder los 100 caracteres' })
    readonly razonSocial: string;

    @IsString({ message: 'El NIT/CI debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El NIT/CI es obligatorio' })
    @MaxLength(20, { message: 'El NIT/CI no puede exceder los 20 caracteres' })
    readonly nitCi: string;

    @IsString()
    @IsOptional()
    @MaxLength(15, { message: 'El teléfono no puede exceder los 15 caracteres' })
    readonly telefono?: string;

    @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
    @IsOptional()
    @MaxLength(100)
    readonly email?: string;

    @IsBoolean()
    @IsOptional()
        readonly estado: boolean;    

}
