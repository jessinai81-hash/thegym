// Vitest global setup: removes test accounts left behind by an interrupted earlier run,
// and again once all test files have finished.
import { ensureEnv } from '../../server/env.js'
import { deleteTestUsers } from './cleanup.js'

export async function setup() {
  ensureEnv()
  if (!process.env.DATABASE_URL) {
    console.warn('\n  ⚠ DATABASE_URL is not set: API tests will be skipped (logic tests still run).\n')
    return
  }
  await deleteTestUsers('pf-test-%@example.com')
}

export async function teardown() {
  const removed = await deleteTestUsers('pf-test-%@example.com')
  if (removed.length) console.log(`  ✓ Cleaned up ${removed.length} test account(s)`)
}
