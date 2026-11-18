import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  const usuarioService = {
    validate: jest.fn(),
    findOne: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuarioService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns a camelCase access token without password data', async () => {
    usuarioService.validate.mockResolvedValue({
      id: 7,
      usuario: 'anime-user',
      nombreCompleto: 'Anime User',
      rol: 'VENDEDOR',
      estado: true,
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(
      service.login({ usuario: 'anime-user', clave: 'password' }),
    ).resolves.toEqual({
      id: 7,
      usuario: 'anime-user',
      nombreCompleto: 'Anime User',
      rol: 'VENDEDOR',
      estado: true,
      accessToken: 'signed-token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 7 });
  });

  it('accepts active CLIENTE accounts when validating a JWT', async () => {
    const cliente = {
      id: 9,
      usuario: 'cliente01',
      nombreCompleto: 'Cliente Uno',
      rol: 'CLIENTE',
      estado: true,
    };
    usuarioService.findOne.mockResolvedValue(cliente);

    await expect(service.verifyPayload({ sub: 9 })).resolves.toEqual(cliente);
  });
});
