import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRevocadoEnToUsuariosRol1729662000000
  implements MigrationInterface
{
  name = 'AddRevocadoEnToUsuariosRol1729662000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "usuarios_rol" ADD COLUMN IF NOT EXISTS "revocado_en" TIMESTAMP NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "usuarios_rol" DROP COLUMN IF EXISTS "revocado_en"',
    );
  }
}
