// Loads .env for local development and fills in a JWT_SECRET if one is missing.
// On Vercel the same variables come from the project settings instead.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env')

export const NEON_HELP = `
  DATABASE_URL is missing from your .env file.

  Get it from Neon (free):
    1. Go to https://console.neon.tech and sign in (or sign up, it's free).
    2. Create a project (any name, e.g. "pulsefit"; pick the region closest to you).
    3. On the project dashboard, click the "Connect" button (top right).
    4. In the "Connect to your database" dialog keep Branch: main, Database: neondb,
       turn "Connection pooling" ON, and click "Show password".
    5. Copy the connection string. It looks like:
         postgresql://neondb_owner:xxxx@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
    6. Paste it into .env in this folder:
         DATABASE_URL=postgresql://...
    7. Run:  npm run db:setup   then   npm run dev
`

export function ensureEnv({ requireDatabase = false } = {}) {
  if (!existsSync(envPath)) {
    writeFileSync(envPath, '# PulseFit local secrets. Never commit this file.\nDATABASE_URL=\nJWT_SECRET=\n')
  }
  process.loadEnvFile(envPath)

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    const secret = randomBytes(48).toString('base64url')
    const text = readFileSync(envPath, 'utf8')
    const next = /^JWT_SECRET=.*$/m.test(text)
      ? text.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`)
      : `${text.trimEnd()}\nJWT_SECRET=${secret}\n`
    writeFileSync(envPath, next)
    process.env.JWT_SECRET = secret
    console.log('  ✓ Generated a strong JWT_SECRET and saved it to .env')
  }

  if (!process.env.DATABASE_URL) {
    console.warn(NEON_HELP)
    if (requireDatabase) process.exit(1)
    return false
  }
  return true
}
