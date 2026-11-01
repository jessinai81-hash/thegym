// npm run db:setup — creates tables (db/schema.sql) and loads sample data (db/seed.sql).
// Safe to run again: the schema uses IF NOT EXISTS and the seed skips/updates existing rows.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Client, neonConfig } from '@neondatabase/serverless'
import { ensureEnv, root } from '../server/env.js'

ensureEnv({ requireDatabase: true })
neonConfig.webSocketConstructor ??= globalThis.WebSocket

const schema = readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8')
const seed = readFileSync(path.join(root, 'db', 'seed.sql'), 'utf8')
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const client = new Client(process.env.DATABASE_URL)
try {
  await client.connect()
  console.log('  ✓ Connected to Neon')
  await client.query('BEGIN')
  await client.query(`SET LOCAL TIME ZONE '${timeZone.replace(/'/g, '')}'`)
  await client.query(schema)
  console.log('  ✓ Schema ready (db/schema.sql)')
  await client.query(seed)
  console.log(`  ✓ Sample data loaded (db/seed.sql, class times in ${timeZone})`)
  await client.query('COMMIT')

  const { rows } = await client.query(`
    SELECT 'exercises' AS "table", count(*)::int AS rows FROM exercises
    UNION ALL SELECT 'classes', count(*)::int FROM classes
    UNION ALL SELECT 'users', count(*)::int FROM users
    UNION ALL SELECT 'workouts', count(*)::int FROM workouts`)
  console.table(rows)
} catch (err) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('\n  ✗ Database setup failed:', err.message)
  if (/password authentication|28P01/i.test(err.message)) {
    console.error('    The password in DATABASE_URL was rejected. Copy the connection string from Neon again (click "Show password").')
  } else if (/ENOTFOUND|getaddrinfo|ECONNREFUSED|timeout|fetch failed/i.test(err.message)) {
    console.error('    Could not reach Neon. Check your internet connection and that DATABASE_URL is complete.')
  }
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
