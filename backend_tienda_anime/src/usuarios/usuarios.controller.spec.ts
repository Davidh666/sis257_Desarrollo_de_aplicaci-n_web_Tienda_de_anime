import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { IS_PUBLIC_KEY } from '../auth/decorators/auth-public.decorator';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { RegisterUsuarioDto } from './dto/register-usuario.dto';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let usuariosService: { create: jest.Mock };

  beforeEach(async () => {
    usuariosService = { create: jest.fn().mockImplementation((usuario) => usuario) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: usuariosService,
        },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('marks registration public and overrides the administrator role requirement', () => {
    const registrationHandler = Object.getOwnPropertyDescriptor(
      UsuariosController.prototype,
      'register',
    )?.value;

    expect(
      Reflect.getMetadata(IS_PUBLIC_KEY, registrationHandler),
    ).toBe(true);
    expect(
      Reflect.getMetadata(ROLES_KEY, registrationHandler),
    ).toEqual([]);
  });

  it('always registers a new account as an active client', async () => {
    const registration = Object.assign(new RegisterUsuarioDto(), {
      usuario: 'cliente01',
      nombreCompleto: 'Akira Tanaka',
      clave: 'secret123',
    });

    await controller.register(registration);

    expect(usuariosService.create).toHaveBeenCalledWith({
      usuario: 'cliente01',
      nombreCompleto: 'Akira Tanaka',
      clave: 'secret123',
      rol: 'CLIENTE',
      estado: true,
    }, 'CLIENTE');
  });

  it('restricts client profile management to administrators and vendors', () => {
    for (const methodName of ['findClients', 'createClientProfile']) {
      const handler = Object.getOwnPropertyDescriptor(
        UsuariosController.prototype,
        methodName,
      )?.value;

      expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual([
        'ADMINISTRADOR',
        'VENDEDOR',
      ]);
    }
  });
});
