const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_LO1Hp6zaASDF@ep-broad-grass-beyn3aro-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function cleanDB() {
  try {
    await client.connect();
    console.log('Connected to Neon');

    // Drop all tables
    const tables = ['mensajes', 'sesiones', 'goals', 'usuarios', 'incrustaciones', 'alertas_crisis', 'costes_por_proveedor', 'configuraciones_sistema'];
    
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✓ Dropped table: ${table}`);
      } catch (e) {
        console.log(`  Skipped ${table}`);
      }
    }

    // Drop enums
    const enums = ['configuraciones_sistema_tipovalor_enum', 'mensajes_rol_enum', 'mensajes_etapa_enum', 'sesiones_etapaactual_enum', 'sesiones_status_enum', 'alertas_crisis_nivelriesgo_enum', 'costes_por_proveedor_proveedor_enum'];
    for (const e of enums) {
      try {
        await client.query(`DROP TYPE IF EXISTS ${e}`);
        console.log(`✓ Dropped enum: ${e}`);
      } catch (err) {
        console.log(`  Skipped enum ${e}`);
      }
    }

    console.log('\n✅ Database cleaned');
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanDB();
