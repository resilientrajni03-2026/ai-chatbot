# PostgreSQL migrations

All database schema changes for this application must be made through migration files.

Create a migration:

```bash
npm run db:migrate:create --workspace backend -- add-users
```

Apply migrations:

```bash
npm run db:migrate
```

Rules:

1. Never manually modify the database schema for application changes.
2. Never edit a migration after it has been applied to a shared database.
3. Use a new migration for every schema change.
4. Keep migrations reversible with an `up` and `down` operation where practical.
