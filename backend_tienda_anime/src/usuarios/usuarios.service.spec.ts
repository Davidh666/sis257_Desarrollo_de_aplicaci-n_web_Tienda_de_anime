import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let queryBuilder: {
    where: jest.Mock;
    select: jest.Mock;
    addSelect: jest.Mock;
    getOne: jest.Mock;
  };
  let usuariosRepository: {
    createQueryBuilder: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    usuariosRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      save: jest.fn().mockImplementation(async (usuario: Usuario) => {
        await usuario.hashPassword();
        return usuario;
      }),
      findOneBy: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((usuario) => Object.assign(new Usuario(), usuario)),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuariosRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('defaults created users to CLIENTE unless a trusted role is supplied', async () => {
    usuariosRepository.findOneBy.mockResolvedValue(null);
    const createUsuarioDto = Object.assign(new CreateUsuarioDto(), {
      usuario: 'cliente01',
      clave: 'cliente123',
      nombreCompleto: 'Cliente Uno',
    });

    await service.create(createUsuarioDto);

    expect(usuariosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ rol: 'CLIENTE', estado: true }),
    );
  });

  it('creates POS client profiles without login credentials', async () => {
    const cliente = await service.createClientProfile({
      nombreCompleto: 'Akira Tanaka',
      nitCi: '1234567890',
      telefono: '+59170000000',
      email: 'akira@example.com',
    });

    expect(usuariosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clave: null,
        nombreCompleto: 'Akira Tanaka',
        nitCi: '1234567890',
        rol: 'CLIENTE',
        estado: true,
      }),
    );
    expect(cliente.usuario).toMatch(/^cliente_[a-f0-9]{24}$/);
    expect(cliente.clave).toBeNull();
    expect(usuariosRepository.findOneBy).toHaveBeenCalledWith({
      usuario: cliente.usuario,
    });
    expect(usuariosRepository.save).toHaveBeenCalledWith(cliente);
  });

  it('generates a username when the submitted username is empty', async () => {
    usuariosRepository.findOneBy.mockResolvedValue(null);

    const cliente = await service.createClientProfile({
      nombreCompleto: 'Akira Tanaka',
      nitCi: '1234567890',
      usuario: '   ',
    });

    expect(cliente.usuario).toMatch(/^cliente_[a-f0-9]{24}$/);
    expect(cliente.clave).toBeNull();
  });

  it('creates POS client login credentials and hashes the password before saving', async () => {
    usuariosRepository.findOneBy.mockResolvedValue(null);

    const cliente = await service.createClientProfile({
      nombreCompleto: 'Akira Tanaka',
      nitCi: '1234567890',
      usuario: 'akira.tanaka',
      clave: 'claveSegura123',
    });

    expect(cliente.usuario).toBe('akira.tanaka');
    expect(cliente.clave).not.toBe('claveSegura123');
    expect(await bcrypt.compare('claveSegura123', cliente.clave!)).toBe(true);
    expect(usuariosRepository.save).toHaveBeenCalledWith(cliente);
  });

  it('rejects duplicate usernames when creating POS client credentials', async () => {
    usuariosRepository.findOneBy.mockResolvedValue({ id: 2 });

    await expect(
      service.createClientProfile({
        nombreCompleto: 'Akira Tanaka',
        nitCi: '1234567890',
        usuario: 'akira.tanaka',
        clave: 'claveSegura123',
      }),
    ).rejects.toThrow(ConflictException);
    expect(usuariosRepository.save).not.toHaveBeenCalled();
  });

  it('lists only active client profiles without selecting the password', async () => {
    await service.findClients();

    expect(usuariosRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { rol: 'CLIENTE', estado: true },
        select: expect.not.objectContaining({ clave: true }),
      }),
    );
  });

  it('selects the hidden hash explicitly and validates a bcrypt password', async () => {
    const usuario = {
      id: 8,
      usuario: 'juan',
      nombreCompleto: 'Juan Anime',
      rol: 'VENDEDOR',
      estado: true,
      clave: await bcrypt.hash('juan1234', 4),
      nitCi: '1234567890',
      email: 'juan@example.com',
    };
    queryBuilder.getOne.mockResolvedValue(usuario);

    await expect(service.validate('juan', 'juan1234')).resolves.toEqual({
      id: 8,
      usuario: 'juan',
      nombreCompleto: 'Juan Anime',
      rol: 'VENDEDOR',
      estado: true,
    });
    expect(usuariosRepository.createQueryBuilder).toHaveBeenCalledWith(
      'usuario',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith('usuario.clave');
    expect(queryBuilder.select).toHaveBeenCalledWith([
      'usuario.id',
      'usuario.usuario',
      'usuario.nombreCompleto',
      'usuario.rol',
      'usuario.estado',
    ]);
    expect(usuariosRepository.save).not.toHaveBeenCalled();
  });

  it('upgrades a matching legacy plain password to bcrypt during login', async () => {
    const usuario = Object.assign(new Usuario(), {
      id: 1,
      usuario: 'admin',
      nombreCompleto: 'Administrador',
      rol: 'ADMINISTRADOR',
      estado: true,
      clave: '123456',
    });
    queryBuilder.getOne.mockResolvedValue(usuario);

    await expect(service.validate('admin', '123456')).resolves.toEqual({
      id: 1,
      usuario: 'admin',
      nombreCompleto: 'Administrador',
      rol: 'ADMINISTRADOR',
      estado: true,
    });
    expect(usuariosRepository.save).toHaveBeenCalledWith(usuario);
    expect(await bcrypt.compare('123456', usuario.clave)).toBe(true);
  });

  it('rejects invalid credentials', async () => {
    queryBuilder.getOne.mockResolvedValue({
      id: 8,
      usuario: 'juan',
      nombreCompleto: 'Juan Anime',
      rol: 'VENDEDOR',
      estado: true,
      clave: await bcrypt.hash('juan1234', 4),
    });

    await expect(service.validate('juan', 'incorrecta')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects safely when the selected password column is unexpectedly missing', async () => {
    queryBuilder.getOne.mockResolvedValue({
      id: 8,
      usuario: 'juan',
      nombreCompleto: 'Juan Anime',
      rol: 'VENDEDOR',
      estado: true,
    });

    await expect(service.validate('juan', 'juan1234')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('does not allow profiles without credentials to log in', async () => {
    queryBuilder.getOne.mockResolvedValue({
      id: 8,
      usuario: 'legacy-client',
      nombreCompleto: 'Cliente legado',
      rol: 'CLIENTE',
      estado: true,
      clave: null,
    });

    await expect(
      service.validate('legacy-client', 'cualquier-clave'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
