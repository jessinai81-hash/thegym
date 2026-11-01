import request from 'supertest'
import { neon } from '@neondatabase/serverless'
import { createApp } from '../server/app.js'

export const hasDb = Boolean(process.env.DATABASE_URL)

let appPromise
export const getApp = () => (appPromise ??= createApp())

let sqlClient
export const sql = (...args) => (sqlClient ??= neon(process.env.DATABASE_URL))(...args)

let counter = 0
export function testEmail(tag = 'user') {
  return `pf-test-${tag}-${Date.now()}-${++counter}-${Math.random().toString(36).slice(2, 7)}@example.com`
}

export const PASSWORD = 'Passw0rd!'

/** Signs up a fresh throwaway user and returns a cookie-keeping supertest agent for them. */
export async function newUser(overrides = {}) {
  const agent = request.agent(await getApp())
  const body = {
    fullName: 'Vitest Runner',
    email: testEmail(),
    password: PASSWORD,
    weeklyGoalWorkouts: 3,
    weeklyGoalMinutes: 60,
    ...overrides,
  }
  const res = await agent.post('/api/auth/signup').send(body)
  if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`)
  return { agent, user: res.body.user, credentials: body }
}

/** A client with no cookies at all. */
export async function anon() {
  return request(await getApp())
}

export async function exerciseByName(agent, name) {
  const res = await agent.get('/api/exercises')
  const ex = res.body.exercises.find((e) => e.name === name)
  if (!ex) throw new Error(`exercise not found: ${name}`)
  return ex
}

/** Inserts a completed workout on a given UTC date, bypassing the API (for streak/chart tests). */
export async function seedCompletedWorkout(userId, date, minutes = 15) {
  await sql`
    INSERT INTO workouts (user_id, name, workout_date, status, duration_minutes, started_at, completed_at)
    VALUES (${userId}, 'Seeded test workout', ${date}::date, 'completed', ${minutes},
            ((${date}::date + time '12:00') AT TIME ZONE 'UTC') - make_interval(mins => ${minutes}::int),
            (${date}::date + time '12:00') AT TIME ZONE 'UTC')`
}

/** Pretends a workout was started `minutes` ago so its saved duration is predictable. */
export async function backdateStart(workoutId, minutes) {
  await sql`UPDATE workouts SET started_at = now() - make_interval(mins => ${minutes}::int) WHERE id = ${workoutId}`
}

export function cookieHeader(res) {
  return [].concat(res.headers['set-cookie'] ?? []).join('; ')
}
