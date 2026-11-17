import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
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
    return this.usuariosRepository.remove(usuario);
  }

  async validate(usuarioStr: string, claveStr: string): Promise<Usuario> {
    const usuarioOk = await this.usuariosRepository.findOne({
      where: { usuario: usuarioStr },
      select: {
        id: true,
        usuario: true,
        clave: true,
        nombreCompleto: true,
        rol: true,
        estado: true,
      },
    });

    if (!usuarioOk || !usuarioOk.estado) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    const isPasswordValid = await bcrypt.compare(claveStr, usuarioOk.clave);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    delete (usuarioOk as any).clave;
    return usuarioOk;
  }