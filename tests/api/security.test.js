import { beforeAll, describe, expect, it } from 'vitest'
import { anon, exerciseByName, hasDb, newUser } from '../helpers.js'

describe.skipIf(!hasDb)('security: users only ever see and change their own data', () => {
  let a, b, aWorkout, aSet, aWorkoutExerciseId

  beforeAll(async () => {
    a = await newUser({ fullName: 'User A' })
    b = await newUser({ fullName: 'User B' })
    const plank = await exerciseByName(a.agent, 'Plank Hold')
    const res = await a.agent.post('/api/workouts/add-exercise').send({ exerciseId: plank.id })
    aWorkout = res.body.workout
    aWorkoutExerciseId = aWorkout.exercises[0].workoutExerciseId
    aSet = aWorkout.exercises[0].setsDetail[0]
  })

  it('B cannot see A’s workout', async () => {
    expect((await b.agent.get('/api/workouts')).body.workout).toBeNull()
    expect((await b.agent.get('/api/dashboard')).body.today).toBeNull()
  })

  it('B cannot tick or untick A’s sets', async () => {
    const res = await b.agent.patch('/api/sets').send({ setId: aSet.id, completed: true })
    expect(res.status).toBe(404)
    const mine = (await a.agent.get('/api/workouts')).body.workout
    expect(mine.exercises[0].setsDetail[0].completed).toBe(false)
  })

  it('B cannot start, complete or edit A’s workout', async () => {
    expect((await b.agent.post('/api/workouts/start').send({ workoutId: aWorkout.id })).status).toBe(404)
    expect((await b.agent.post('/api/workouts/complete').send({ workoutId: aWorkout.id })).status).toBe(404)
    expect((await b.agent.post('/api/workouts/remove-exercise').send({ workoutExerciseId: aWorkoutExerciseId })).status).toBe(404)

    const mine = (await a.agent.get('/api/workouts')).body.workout
    expect(mine).toMatchObject({ id: aWorkout.id, status: 'planned' })
    expect(mine.exercises).toHaveLength(1)
  })

  it('B adding exercises creates B’s own workout, never touching A’s', async () => {
    const rope = await exerciseByName(b.agent, 'Jump Rope')
    const res = await b.agent.post('/api/workouts/add-exercise').send({ exerciseId: rope.id })
    expect(res.body.workout.id).not.toBe(aWorkout.id)
    expect((await a.agent.get('/api/workouts')).body.workout.exercises.map((e) => e.name)).toEqual(['Plank Hold'])
  })

  it('/api/auth/me and /api/dashboard describe the caller only', async () => {
    expect((await b.agent.get('/api/auth/me')).body.user.fullName).toBe('User B')
    expect((await a.agent.get('/api/dashboard')).body.firstName).toBe('User')
    expect((await a.agent.get('/api/auth/me')).body.user.id).toBe(a.user.id)
  })

  it.each([
    ['get', '/api/auth/me'],
    ['get', '/api/dashboard'],
    ['get', '/api/workouts'],
    ['post', '/api/workouts'],
    ['post', '/api/workouts/add-exercise'],
    ['post', '/api/workouts/remove-exercise'],
    ['post', '/api/workouts/start'],
    ['post', '/api/workouts/complete'],
    ['patch', '/api/sets'],
  ])('%s %s returns 401 without login', async (method, path) => {
    const res = await (await anon())[method](path).send({ workoutId: aWorkout.id, setId: aSet.id, exerciseId: 1, workoutExerciseId: aWorkoutExerciseId, completed: true })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('unauthorized')
  })

  it('nothing A did leaked into B’s session through the protected routes above', async () => {
    const mine = (await a.agent.get('/api/workouts')).body.workout
    expect(mine.status).toBe('planned')
    expect(mine.exercises[0].setsDetail[0].completed).toBe(false)
  })
})
