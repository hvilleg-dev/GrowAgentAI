import { AppDataSource } from '../database/db';

async function cleanDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('🗑️ Deleting all records...');

    // Drop foreign key constraints and delete in correct order
    await queryRunner.query('DELETE FROM "AlertaCrisis"');
    console.log('✅ Deleted AlertaCrisis');

    await queryRunner.query('DELETE FROM "Mensaje"');
    console.log('✅ Deleted Mensaje');

    await queryRunner.query('DELETE FROM "Sesion"');
    console.log('✅ Deleted Sesion');

    await queryRunner.query('DELETE FROM "Goal"');
    console.log('✅ Deleted Goal');

    await queryRunner.query('DELETE FROM "Incrustacion"');
    console.log('✅ Deleted Incrustacion');

    await queryRunner.query('DELETE FROM "CostePorProveedor"');
    console.log('✅ Deleted CostePorProveedor');

    await queryRunner.query('DELETE FROM "Usuario"');
    console.log('✅ Deleted Usuario');

    console.log('\n✨ Database cleaned successfully!');
    await queryRunner.release();
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase();
