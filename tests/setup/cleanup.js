// Test accounts always use these email patterns, so cleanup can never touch real users.
// Deleting a user cascades to their workouts, workout_exercises and workout_sets.
import { neon } from '@neondatabase/serverless'

export const TEST_EMAIL_DOMAIN = 'example.com'

export async function deleteTestUsers(pattern) {
  if (!process.env.DATABASE_URL) return []
  if (!/^pf-(test|e2e)-%@example\.com$/.test(pattern)) throw new Error(`Refusing unsafe cleanup pattern: ${pattern}`)
  const sql = neon(process.env.DATABASE_URL)
  const rows = await sql`DELETE FROM users WHERE email LIKE ${pattern} RETURNING email`
  return rows.map((r) => r.email)
}
