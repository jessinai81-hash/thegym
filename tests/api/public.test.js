import { describe, expect, it } from 'vitest'
import { anon, hasDb } from '../helpers.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

describe.skipIf(!hasDb)('/api/stats', () => {
  it('returns members, workouts completed and classes this week as whole numbers', async () => {
    const res = await (await anon()).get('/api/stats')
    expect(res.status).toBe(200)
    expect(Object.keys(res.body).sort()).toEqual(['classesThisWeek', 'members', 'workoutsCompleted'])
    for (const v of Object.values(res.body)) {
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
    }
  })

  it('ignores a bogus time zone header instead of crashing', async () => {
    const res = await (await anon()).get('/api/stats').set('x-timezone', 'Mars/Olympus_Mons')
    expect(res.status).toBe(200)
  })
})

describe.skipIf(!hasDb)('/api/exercises', () => {
  it('returns all 30 exercises with the fields the Library needs', async () => {
    const res = await (await anon()).get('/api/exercises')
    expect(res.status).toBe(200)
    expect(res.body.exercises).toHaveLength(30)
    for (const e of res.body.exercises) {
      expect(e).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        muscleGroup: expect.stringMatching(/^(Chest|Back|Legs|Arms|Core|Cardio)$/),
        sets: expect.any(Number),
        reps: expect.any(String),
        difficulty: expect.stringMatching(/^(Beginner|Intermediate|Advanced)$/),
        restSeconds: expect.any(Number),
        description: expect.any(String),
      })
    }
    expect(new Set(res.body.exercises.map((e) => e.name)).size).toBe(30)
  })

  it.each(GROUPS)('filter %s returns exactly its 5 exercises', async (group) => {
    const res = await (await anon()).get('/api/exercises').query({ group })
    expect(res.status).toBe(200)
    expect(res.body.exercises).toHaveLength(5)
    expect(res.body.exercises.every((e) => e.muscleGroup === group)).toBe(true)
  })

  it('"All" returns everything and an unknown group is a 400', async () => {
    const a = await anon()
    expect((await a.get('/api/exercises').query({ group: 'All' })).body.exercises).toHaveLength(30)
    const bad = await a.get('/api/exercises').query({ group: 'Toes' })
    expect(bad.status).toBe(400)
    expect(bad.body.error).toBe('bad_group')
  })
})

describe('routing', () => {
  it('unknown API routes return a JSON 404', async () => {
    const res = await (await anon()).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('not_found')
  })
})
