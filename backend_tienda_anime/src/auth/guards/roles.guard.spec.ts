import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);
  const handler = () => undefined;
  const controller = class {};

  function createContext(rol?: 'ADMINISTRADOR' | 'VENDEDOR'): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => (rol ? { user: { rol } } : {}),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows routes without role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('denies a vendor access to administrator routes', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMINISTRADOR']);

    expect(() => guard.canActivate(createContext('VENDEDOR'))).toThrow(
      ForbiddenException,
    );
  });

  it('allows a user whose role is explicitly required', () => {
    reflector.getAllAndOverride.mockReturnValue(['VENDEDOR']);

    expect(guard.canActivate(createContext('VENDEDOR'))).toBe(true);
  });
});
