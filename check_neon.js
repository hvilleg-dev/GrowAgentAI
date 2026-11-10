const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_LO1Hp6zaASDF@ep-broad-grass-beyn3aro-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTables() {
  try {
    await client.connect();
    console.log('✅ Connected to Neon\n');

    // List all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Tables in database:');
    if (result.rows.length === 0) {
      console.log('   (No tables found)');
    } else {
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }

    // Count records in each table
    console.log('\n📊 Record counts:');
    for (const row of result.rows) {
      const countResult = await client.query(`SELECT COUNT(*) as count FROM "${row.table_name}"`);
      console.log(`   ${row.table_name}: ${countResult.rows[0].count} records`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
