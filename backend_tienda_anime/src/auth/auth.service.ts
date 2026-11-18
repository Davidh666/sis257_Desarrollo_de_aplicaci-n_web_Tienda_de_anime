import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(
    authLoginDto: AuthLoginDto,
  ): Promise<
    Pick<Usuario, 'id' | 'usuario' | 'nombreCompleto' | 'rol' | 'estado'> & {
      accessToken: string;
    }
  > {
    const { usuario, clave } = authLoginDto;
    const usuarioOk = await this.usuarioService.validate(usuario, clave);

    const payload = { sub: usuarioOk.id };
    const accessToken = await this.getAccessToken(payload);

    return { ...usuarioOk, accessToken };
  }

  async getAccessToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  async verifyPayload(payload: JwtPayload): Promise<Usuario> {
    let usuario: Usuario;
    try {
      usuario = await this.usuarioService.findOne(payload.sub);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Token inválido');
      }
      throw error;
    }

    if (
      !usuario.estado ||
      !['ADMINISTRADOR', 'VENDEDOR', 'CLIENTE'].includes(usuario.rol)
    ) {
      throw new UnauthorizedException('La cuenta no está habilitada');
    }

    return usuario;
  }
}
