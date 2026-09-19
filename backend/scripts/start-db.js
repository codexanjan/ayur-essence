const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');

async function startDb() {
  const dataDir = path.resolve(__dirname, '..', '.pg-data');
  const isFirstRun = !fs.existsSync(dataDir);

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: 5432,
    user: 'postgres',
    password: 'password',
    persistent: true
  });

  if (isFirstRun) {
    console.log('[PostgreSQL] Initializing new database cluster in', dataDir);
    await pg.initialise();
  }

  console.log('[PostgreSQL] Starting native database engine on port 5432...');
  await pg.start();
  console.log('[PostgreSQL] Database engine is accepting connections on localhost:5432.');

  try {
    await pg.createDatabase('ayur_essence');
    console.log('[PostgreSQL] Database "ayur_essence" ready.');
  } catch (err) {
    // Database might already exist
    console.log('[PostgreSQL] Database status checked (ready).');
  }

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n[PostgreSQL] Stopping database server...');
    try {
      await pg.stop();
      console.log('[PostgreSQL] Database stopped.');
    } catch (e) {
      console.error('[PostgreSQL] Error during shutdown:', e);
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep process alive if run directly
  console.log('[PostgreSQL] Ready. Press Ctrl+C to stop.');
}

if (require.main === module) {
  startDb().catch((err) => {
    console.error('[PostgreSQL] Fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = { startDb };
