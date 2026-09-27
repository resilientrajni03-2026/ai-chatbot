require('dotenv/config');

module.exports = {
  databaseUrlVar: 'DATABASE_URL',
  migrationsDir: './migrations',
  migrationsTable: 'pgmigrations',
  migrationsSchema: 'public',
  migrationFileLanguage: 'ts',
  singleTransaction: true,
  checkOrder: true,
};
