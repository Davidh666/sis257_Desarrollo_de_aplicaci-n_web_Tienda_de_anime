import { QueryRunner, Table } from 'typeorm';
import { ConsolidateClientesIntoUsuarios1760000000000 } from './1760000000000-ConsolidateClientesIntoUsuarios';

describe('ConsolidateClientesIntoUsuarios1760000000000', () => {
  it('preserves legacy profiles and rewrites both sale customer references', async () => {
    let hasLegacyBuyerColumn = true;
    const query = jest.fn().mockImplementation((sql: string) => {
      if (sql.includes('FROM "clientes"')) {
        return [
          {
            id: 7,
            nombreCompleto: 'Cliente anterior',
            nitCi: '1234567890',
            telefono: '70000000',
            email: 'cliente@example.com',
            estado: true,
          },
        ];
      }
      if (sql.includes('INSERT INTO "usuarios"')) {
        return [{ id: 88 }];
      }
      return [];
    });
    const dropColumn = jest.fn().mockImplementation(() => {
      hasLegacyBuyerColumn = false;
    });
    const dropTable = jest.fn();
    const createForeignKey = jest.fn();
    const ventasTable = {
      foreignKeys: [],
      findColumnByName: jest.fn((columnName: string) => {
        if (columnName === 'cliente_id') return {};
        if (columnName === 'cliente_usuario_id' && hasLegacyBuyerColumn) {
          return {};
        }
        return undefined;
      }),
    } as unknown as Table;
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(true),
      getTable: jest.fn().mockResolvedValue(ventasTable),
      dropForeignKey: jest.fn(),
      dropColumn,
      dropTable,
      createForeignKey,
      query,
    } as unknown as QueryRunner;

    await new ConsolidateClientesIntoUsuarios1760000000000().up(queryRunner);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('VALUES ($1, NULL, $2'),
      expect.arrayContaining([
        expect.stringMatching(/^legacy_cliente_7_/),
        'Cliente anterior',
        true,
        '1234567890',
      ]),
    );
    expect(query).toHaveBeenCalledWith(
      'UPDATE "ventas" SET "cliente_id" = $1 WHERE "cliente_id" = $2',
      [88, 7],
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE "cliente_id" IS NULL AND "cliente_usuario_id" IS NOT NULL'),
    );
    expect(dropColumn).toHaveBeenCalledWith(
      'ventas',
      'cliente_usuario_id',
    );
    expect(dropTable).toHaveBeenCalledWith('clientes');
    expect(createForeignKey).toHaveBeenCalled();
  });
});
