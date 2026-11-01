import { neon, neonConfig } from '@neondatabase/serverless'
import { HttpError } from './http.js'

// A dropped or reused network connection surfaces as `TypeError: fetch failed` before any
// response arrives. Retry those briefly; every write in /api is safe to repeat (ON CONFLICT,
// status guards, idempotent set updates), so a retry can't double anything.
const RETRIES = 2
async function fetchWithRetry(url, init) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, init)
    } catch (err) {
      if (attempt >= RETRIES || !(err instanceof TypeError)) throw err
      await new Promise((r) => setTimeout(r, 150 * (attempt + 1)))
    }
  }
}
neonConfig.fetchFunction = fetchWithRetry

let sql

/** Neon HTTP query function. The connection string only ever lives on the server. */
export function db() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new HttpError(
      503,
      'The database isn’t configured yet. Add DATABASE_URL to your .env file and restart the server.',
      'db_not_configured',
    )
  }
  sql ??= neon(url)
  return sql
}
