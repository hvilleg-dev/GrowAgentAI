import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeviceIdToSesiones002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'sesiones',
      new TableColumn({
        name: 'deviceId',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sesiones', 'deviceId');
  }
}
