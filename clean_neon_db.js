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
    console.log('✅ Connected to Neon');

    console.log('🗑️ Deleting all records...\n');

    const queries = [
      { name: 'AlertaCrisis', sql: 'DELETE FROM "AlertaCrisis"' },
      { name: 'Mensaje', sql: 'DELETE FROM "Mensaje"' },
      { name: 'Sesion', sql: 'DELETE FROM "Sesion"' },
      { name: 'Goal', sql: 'DELETE FROM "Goal"' },
      { name: 'Incrustacion', sql: 'DELETE FROM "Incrustacion"' },
      { name: 'CostePorProveedor', sql: 'DELETE FROM "CostePorProveedor"' },
      { name: 'Usuario', sql: 'DELETE FROM "Usuario"' },
      { name: 'ConfiguracionSistema', sql: 'DELETE FROM "ConfiguracionSistema"' },
    ];

    for (const query of queries) {
      try {
        const result = await client.query(query.sql);
        console.log(`✅ Deleted ${query.name}: ${result.rowCount} rows`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`⚠️  Table ${query.name} does not exist (skipped)`);
        } else {
          throw error;
        }
      }
    }

    // Verify
    console.log('\n📊 Verification:');
    const tables = ['Usuario', 'Sesion', 'Mensaje', 'Goal'];
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`   ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`   ${table}: N/A`);
      }
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
