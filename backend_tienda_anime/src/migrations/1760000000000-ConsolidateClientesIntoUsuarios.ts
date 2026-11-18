import { randomBytes } from 'node:crypto';
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class ConsolidateClientesIntoUsuarios1760000000000
  implements MigrationInterface
{
  name = 'ConsolidateClientesIntoUsuarios1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsuarios = await queryRunner.hasTable('usuarios');
    const hasClientes = await queryRunner.hasTable('clientes');
    const hasVentas = await queryRunner.hasTable('ventas');

    if (!hasUsuarios) {
      if (hasClientes || hasVentas) {
        throw new Error(
          'No se pueden consolidar clientes: faltan tablas requeridas de usuarios.',
        );
      }
      return;
    }

    await queryRunner.query(
      'ALTER TABLE "usuarios" ALTER COLUMN "clave" DROP NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "nit_ci" varchar(20)',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "telefono" varchar(15)',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "email" varchar(100)',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_usuarios_nit_ci" ON "usuarios" ("nit_ci")',
    );

    let ventasTable = hasVentas
      ? await queryRunner.getTable('ventas')
      : undefined;
    if (ventasTable) {
      for (const foreignKey of ventasTable.foreignKeys) {
        const hasCustomerColumn = foreignKey.columnNames.some(
          (columnName) =>
            columnName === 'cliente_id' ||
            columnName === 'cliente_usuario_id',
        );
        if (hasCustomerColumn) {
          await queryRunner.dropForeignKey('ventas', foreignKey);
        }
      }
      ventasTable = await queryRunner.getTable('ventas');
    }

    if (hasClientes) {
      const clientes: Array<{
        id: number;
        nombreCompleto: string;
        nitCi: string | null;
        telefono: string | null;
        email: string | null;
        estado: boolean;
      }> = await queryRunner.query(`
        SELECT
          "id",
          "razon_social" AS "nombreCompleto",
          "nit_ci" AS "nitCi",
          "telefono",
          "email",
          "estado"
        FROM "clientes"
        ORDER BY "id"
      `);

      for (const cliente of clientes) {
        const generatedUsername = `legacy_cliente_${cliente.id}_${randomBytes(4).toString('hex')}`;
        const insertedUsers: Array<{ id: number }> = await queryRunner.query(
          `
            INSERT INTO "usuarios"
              ("usuario", "clave", "nombre_completo", "rol", "estado", "nit_ci", "telefono", "email")
            VALUES ($1, NULL, $2, 'CLIENTE', $3, $4, $5, $6)
            RETURNING "id"
          `,
          [
            generatedUsername,
            cliente.nombreCompleto || `Cliente legado ${cliente.id}`,
            cliente.estado ?? true,
            cliente.nitCi,
            cliente.telefono,
            cliente.email,
          ],
        );
        const usuarioId = insertedUsers[0]?.id;
        if (!usuarioId) {
          throw new Error(
            `No se pudo migrar el cliente legado ${cliente.id} a usuarios.`,
          );
        }

        if (ventasTable?.findColumnByName('cliente_id')) {
          await queryRunner.query(
            'UPDATE "ventas" SET "cliente_id" = $1 WHERE "cliente_id" = $2',
            [usuarioId, cliente.id],
          );
        }
      }
    }

    if (
      ventasTable?.findColumnByName('cliente_id') &&
      ventasTable.findColumnByName('cliente_usuario_id')
    ) {
      await queryRunner.query(`
        UPDATE "ventas"
        SET "cliente_id" = "cliente_usuario_id"
        WHERE "cliente_id" IS NULL AND "cliente_usuario_id" IS NOT NULL
      `);
    }

    if (ventasTable?.findColumnByName('cliente_usuario_id')) {
      await queryRunner.dropColumn('ventas', 'cliente_usuario_id');
    }

    if (hasClientes) {
      await queryRunner.dropTable('clientes');
    }

    if (ventasTable?.findColumnByName('cliente_id')) {
      await queryRunner.query(
        'ALTER TABLE "ventas" ALTER COLUMN "cliente_id" DROP NOT NULL',
      );
      const updatedVentasTable = await queryRunner.getTable('ventas');
      const hasUsuarioForeignKey = updatedVentasTable?.foreignKeys.some(
        (foreignKey) =>
          foreignKey.columnNames.includes('cliente_id') &&
          foreignKey.referencedTableName.split('.').pop() === 'usuarios',
      );
      if (!hasUsuarioForeignKey) {
        await queryRunner.createForeignKey(
          'ventas',
          new TableForeignKey({
            name: 'FK_ventas_cliente_usuario',
            columnNames: ['cliente_id'],
            referencedTableName: 'usuarios',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
        );
      }
    }
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      'La consolidación de clientes es irreversible automáticamente; restaura un respaldo antes de revertirla.',
    );
  }
}
