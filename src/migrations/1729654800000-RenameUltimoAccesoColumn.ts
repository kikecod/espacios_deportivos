import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUltimoAccesoColumn1729654800000 implements MigrationInterface {
  name = 'RenameUltimoAccesoColumn1729654800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('usuarios', 'ultimo_acceso_en');
    if (hasColumn) {
      await queryRunner.query(
        'ALTER TABLE "usuarios" RENAME COLUMN "ultimo_acceso_en" TO "ultimo_acceso_en";',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('usuarios', 'ultimo_acceso_en');
    if (hasColumn) {
      await queryRunner.query(
        'ALTER TABLE "usuarios" RENAME COLUMN "ultimo_acceso_en" TO "ultimo_acceso_en";',
      );
    }
  }
}
