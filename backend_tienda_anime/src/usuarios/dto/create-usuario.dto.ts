import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUsuarioDto {
  @IsString({ message: 'El campo usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MaxLength(50, { message: 'El usuario no puede tener más de 50 caracteres' })
  usuario: string;

  @IsString({ message: 'La clave debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La clave es obligatoria' })
  @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres' })
  @MaxLength(255, { message: 'La clave no puede exceder los 255 caracteres' })
  clave: string;

  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @MaxLength(100, { message: 'El nombre completo no puede tener más de 100 caracteres' })
  nombre_completo: string;

  @IsString({ message: 'El rol debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @Matches(/^(ADMINISTRADOR|VENDEDOR)$/, { 
    message: 'El rol debe ser exactamente "ADMINISTRADOR" o "VENDEDOR"' 
  })
  rol: string;

  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @IsOptional()
  estado?: boolean;
}
