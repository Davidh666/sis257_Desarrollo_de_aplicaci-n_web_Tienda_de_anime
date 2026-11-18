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
import { timingSafeEqual } from 'node:crypto';
import { isBcryptHash } from './utils/password.util';
import type { UserRole } from '../auth/interfaces/user-role.interface';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(
    createUsuarioDto: CreateUsuarioDto,
    assignedRole: UserRole = createUsuarioDto.rol ?? 'CLIENTE',
  ): Promise<Usuario> {
    let usuario = await this.usuariosRepository.findOneBy({
      usuario: createUsuarioDto.usuario,
    });
    if (usuario) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    usuario = this.usuariosRepository.create({
      usuario: createUsuarioDto.usuario,
      clave: createUsuarioDto.clave,
      nombreCompleto: createUsuarioDto.nombreCompleto,
      rol: assignedRole,
      estado: createUsuarioDto.estado ?? true,
    });
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

  async validate(
    usuarioStr: string,
    claveStr: string,
  ): Promise<Pick<Usuario, 'id' | 'usuario' | 'nombreCompleto' | 'rol' | 'estado'>> {
    const usuarioOk = await this.usuariosRepository
      .createQueryBuilder('usuario')
      .where('usuario.usuario = :usuario', { usuario: usuarioStr })
      .addSelect('usuario.clave')
      .getOne();

    if (
      !usuarioOk ||
      !usuarioOk.estado ||
      typeof usuarioOk.clave !== 'string' ||
      usuarioOk.clave.length === 0
    ) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    const { clave: storedPassword, ...safeUser } = usuarioOk;
    const isPasswordValid = isBcryptHash(storedPassword)
      ? await bcrypt.compare(claveStr, storedPassword)
      : await this.migrateLegacyPassword(usuarioOk, claveStr, storedPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    return safeUser;
  }

  private async migrateLegacyPassword(
    usuario: Usuario,
    submittedPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    const submittedBuffer = Buffer.from(submittedPassword);
    const storedBuffer = Buffer.from(storedPassword);
    const matches =
      submittedBuffer.length > 0 &&
      submittedBuffer.length === storedBuffer.length &&
      timingSafeEqual(submittedBuffer, storedBuffer);

    if (!matches) {
      return false;
    }

    usuario.clave = submittedPassword;
    await this.usuariosRepository.save(usuario);
    return true;
  }
}