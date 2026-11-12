import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixNullExpiresAt1699741200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update NULL expiresAt values to criadaEn + 45 minutes
    await queryRunner.query(`
      UPDATE sesiones
      SET "expiresAt" = "criadaEn" + interval '45 minutes'
      WHERE "expiresAt" IS NULL
    `);

    // Add NOT NULL constraint
    await queryRunner.query(`
      ALTER TABLE sesiones
      ALTER COLUMN "expiresAt" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sesiones
      ALTER COLUMN "expiresAt" DROP NOT NULL
    `);
  }
}
