import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCategoriaDto {

    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres.' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  @MaxLength(255, { message: 'La descripción no puede tener más de 255 caracteres.' })
  descripcion?: string;

  @IsBoolean({ message: 'El estado debe ser verdadero o falso.' })
  @IsOptional()
  estado?: boolean;

}

