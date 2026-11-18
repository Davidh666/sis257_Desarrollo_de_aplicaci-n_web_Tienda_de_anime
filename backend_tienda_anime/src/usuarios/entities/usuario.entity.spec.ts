import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';

describe('Usuario password hashing', () => {
  it('hashes plaintext passwords and leaves existing bcrypt hashes unchanged', async () => {
    const usuario = new Usuario();
    usuario.clave = 'juan1234';

    await usuario.hashPassword();
    const passwordHash = usuario.clave;

    expect(passwordHash).not.toBe('juan1234');
    expect(passwordHash.startsWith('$2b$')).toBe(true);
    expect(await bcrypt.compare('juan1234', passwordHash)).toBe(true);

    await usuario.hashPassword();

    expect(usuario.clave).toBe(passwordHash);
  });
});
