import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Validar si ya existe un usuario con el mismo nombre de usuario
    let usuario = await this.usuariosRepository.findOneBy({
      usuario: createUsuarioDto.usuario,
    });
    if (usuario) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    usuario = this.usuariosRepository.create(createUsuarioDto);
    return this.usuariosRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    Object.assign(usuario, updateUsuarioDto);
    return this.usuariosRepository.save(usuario);
  }

  async remove(id: number): Promise<Usuario> {
    const usuario = await this.findOne(id);
    // Nota: Dependiendo de tu lógica de negocio, a veces se prefiere un borrado lógico (estado = false)
    return this.usuariosRepository.remove(usuario);


  }

  async login(usuarioStr: string, claveStr: string) {
    const user = await this.usuariosRepository.findOne({
      where: { usuario: usuarioStr },
    });

    if (!user || user.clave !== claveStr) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    return {
      token: 'jwt-token-akiba-store',
      user: {
        id: user.id,
        usuario: user.usuario,
        nombre_completo: user.nombre_completo,
        rol: user.rol, // 'ADMINISTRADOR' o 'VENDEDOR'
      },
    };
  }
}

