import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAuthTokensAndIndices1729651200000 implements MigrationInterface {
  name = 'CreateAuthTokensAndIndices1729651200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryRunner.createTable(
      new Table({
        name: 'auth_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['PASSWORD_RESET', 'EMAIL_VERIFICATION'],
            enumName: 'auth_tokens_type_enum',
          },
          {
            name: 'token_hash',
            type: 'varchar',
            length: '128',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expires_at',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'consumed_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'request_ip',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'auth_tokens',
      new TableForeignKey({
        name: 'FK_auth_tokens_usuario',
        columnNames: ['user_id'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id_usuario'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'auth_tokens',
      new TableIndex({
        name: 'IDX_auth_tokens_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_usuarios_rol_usuario" ON "usuarios_rol" ("id_usuario")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_usuarios_rol_rol" ON "usuarios_rol" ("id_rol")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_usuarios_rol_rol"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_usuarios_rol_usuario"');
    await queryRunner.dropIndex('auth_tokens', 'IDX_auth_tokens_user_id');

    await queryRunner.dropForeignKey('auth_tokens', 'FK_auth_tokens_usuario');
    await queryRunner.dropTable('auth_tokens');
    await queryRunner.query('DROP TYPE IF EXISTS "auth_tokens_type_enum";');
  }
}
