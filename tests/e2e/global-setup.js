import { ensureEnv } from '../../server/env.js'
import { deleteTestUsers } from '../setup/cleanup.js'

export default async function globalSetup() {
  ensureEnv()
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing: browser tests need the database. See .env.example.')
  await deleteTestUsers('pf-e2e-%@example.com') // leftovers from an interrupted run
}
