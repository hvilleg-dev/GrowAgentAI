const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_LO1Hp6zaASDF@ep-broad-grass-beyn3aro-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function cleanDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to Neon\n');

    console.log('🗑️ Deleting all records...\n');

    const tables = [
      'alertas_crisis',
      'mensajes',
      'sesiones',
      'goals',
      'incrustaciones',
      'costes_por_proveedor',
      'usuarios',
      'configuraciones_sistema'
    ];

    for (const table of tables) {
      const result = await client.query(`DELETE FROM "${table}"`);
      console.log(`✅ Deleted ${table}: ${result.rowCount} rows`);
    }

    // Verify
    console.log('\n📊 Verification after cleanup:');
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
      console.log(`   ${table}: ${result.rows[0].count} records`);
    }

    console.log('\n✨ Database cleaned successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanDatabase();
