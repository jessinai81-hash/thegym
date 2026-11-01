import { ensureEnv } from '../../server/env.js'
import { deleteTestUsers } from '../setup/cleanup.js'

export default async function globalTeardown() {
  ensureEnv()
  const removed = await deleteTestUsers('pf-e2e-%@example.com')
  if (removed.length) console.log(`  ✓ Cleaned up ${removed.length} browser-test account(s)`)
}
