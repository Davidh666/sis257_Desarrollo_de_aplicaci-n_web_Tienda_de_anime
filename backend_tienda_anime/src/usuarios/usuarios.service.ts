import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { CreateClientePerfilDto } from './dto/create-cliente-perfil.dto';
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
    if (createUsuarioDto.nitCi) {
      const cliente = await this.usuariosRepository.findOneBy({
        nitCi: createUsuarioDto.nitCi,
      });
      if (cliente) {
        throw new ConflictException('El NIT/CI ya está registrado');
      }
    }

    usuario = this.usuariosRepository.create({
      usuario: createUsuarioDto.usuario,
      clave: createUsuarioDto.clave,
      nombreCompleto: createUsuarioDto.nombreCompleto,
      rol: assignedRole,
      estado: createUsuarioDto.estado ?? true,
      nitCi: createUsuarioDto.nitCi ?? null,
      telefono: createUsuarioDto.telefono ?? null,
      email: createUsuarioDto.email ?? null,
    });
    return this.usuariosRepository.save(usuario);
  }

  async findClients(): Promise<Usuario[]> {
    return this.usuariosRepository.find({
      where: { rol: 'CLIENTE', estado: true },
      select: {
        id: true,
        usuario: true,
        nombreCompleto: true,
        nitCi: true,
        telefono: true,
        email: true,
        rol: true,
        estado: true,
      },
      order: { nombreCompleto: 'ASC' },
    });
  }

  async createClientProfile(
    createClientePerfilDto: CreateClientePerfilDto,
  ): Promise<Usuario> {
    let username = createClientePerfilDto.usuario?.trim();
    if (username) {
      const existingUser = await this.usuariosRepository.findOneBy({
        usuario: username,
      });
      if (existingUser) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    } else {
      username = await this.generateUniqueClientUsername();
    }

    const existingClient = await this.usuariosRepository.findOneBy({
      nitCi: createClientePerfilDto.nitCi,
    });
    if (existingClient) {
      throw new ConflictException('El cliente con este NIT/CI ya existe');
    }

    const usuario = this.usuariosRepository.create({
      usuario: username,
      clave: createClientePerfilDto.clave || null,
      nombreCompleto: createClientePerfilDto.nombreCompleto,
      nitCi: createClientePerfilDto.nitCi,
      telefono: createClientePerfilDto.telefono ?? null,
      email: createClientePerfilDto.email ?? null,
      rol: 'CLIENTE',
      estado: true,
    });
    return this.usuariosRepository.save(usuario);
  }

  private async generateUniqueClientUsername(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const username = `cliente_${randomBytes(12).toString('hex')}`;
      const existingUser = await this.usuariosRepository.findOneBy({
        usuario: username,
      });
      if (!existingUser) {
        return username;
      }
    }

    throw new ConflictException(
      'No se pudo generar un nombre de usuario único para el cliente.',
    );
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
      .select([
        'usuario.id',
        'usuario.usuario',
        'usuario.nombreCompleto',
        'usuario.rol',
        'usuario.estado',
      ])
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

    const storedPassword = usuarioOk.clave;
    const isPasswordValid = isBcryptHash(storedPassword)
      ? await bcrypt.compare(claveStr, storedPassword)
      : await this.migrateLegacyPassword(usuarioOk, claveStr, storedPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    return {
      id: usuarioOk.id,
      usuario: usuarioOk.usuario,
      nombreCompleto: usuarioOk.nombreCompleto,
      rol: usuarioOk.rol,
      estado: usuarioOk.estado,
    };
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