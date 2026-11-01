// Loads .env (DATABASE_URL, JWT_SECRET) into every test worker.
import { ensureEnv } from '../../server/env.js'

ensureEnv()
