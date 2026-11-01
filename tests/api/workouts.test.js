import { beforeAll, describe, expect, it } from 'vitest'
import { backdateStart, exerciseByName, hasDb, newUser } from '../helpers.js'

describe.skipIf(!hasDb)('concurrent requests', () => {
  it('two adds at the same moment make one workout containing both exercises', async () => {
    const { agent } = await newUser()
    const [plank, rope] = await Promise.all([exerciseByName(agent, 'Plank Hold'), exerciseByName(agent, 'Jump Rope')])
    const results = await Promise.all([
      agent.post('/api/workouts/add-exercise').send({ exerciseId: plank.id }),
      agent.post('/api/workouts/add-exercise').send({ exerciseId: rope.id }),
    ])
    expect(results.map((r) => r.status).sort()).toEqual([201, 201])
    expect(results[0].body.workout.id).toBe(results[1].body.workout.id)
    const w = (await agent.get('/api/workouts')).body.workout
    expect(w.exercises.map((e) => e.name).sort()).toEqual(['Jump Rope', 'Plank Hold'])
    expect(w.exercises.flatMap((e) => e.setsDetail)).toHaveLength(plank.sets + rope.sets)
  })
})

describe.skipIf(!hasDb)('workout lifecycle: create → add → start → tick → complete', () => {
  let agent, plank, pallof, rope, workoutId

  beforeAll(async () => {
    ;({ agent } = await newUser())
    plank = await exerciseByName(agent, 'Plank Hold')
    pallof = await exerciseByName(agent, 'Pallof Press')
    rope = await exerciseByName(agent, 'Jump Rope')
  })

  it('starts with no workout today', async () => {
    const res = await agent.get('/api/workouts')
    expect(res.status).toBe(200)
    expect(res.body.workout).toBeNull()
  })

  it('creates today’s workout, and creating again returns the same one', async () => {
    const first = await agent.post('/api/workouts')
    expect(first.status).toBe(201)
    expect(first.body.created).toBe(true)
    expect(first.body.workout).toMatchObject({ status: 'planned', exercises: [] })
    workoutId = first.body.workout.id

    const again = await agent.post('/api/workouts')
    expect(again.status).toBe(200)
    expect(again.body.workout.id).toBe(workoutId)
  })

  it('adds an exercise with one row per set, and names the workout after it', async () => {
    const res = await agent.post('/api/workouts/add-exercise').send({ exerciseId: plank.id })
    expect(res.status).toBe(201)
    expect(res.body.workout.id).toBe(workoutId)
    expect(res.body.workout.name).toBe('Core Day')
    const [ex] = res.body.workout.exercises
    expect(ex).toMatchObject({ exerciseId: plank.id, name: 'Plank Hold', restSeconds: plank.restSeconds })
    expect(ex.setsDetail.map((s) => s.setNumber)).toEqual(Array.from({ length: plank.sets }, (_, i) => i + 1))
    expect(ex.setsDetail.every((s) => s.completed === false)).toBe(true)
  })

  it('adding the same exercise twice does not duplicate it', async () => {
    const res = await agent.post('/api/workouts/add-exercise').send({ exerciseId: plank.id })
    expect(res.status).toBe(200)
    expect(res.body.alreadyAdded).toBe(true)
    expect(res.body.workout.exercises).toHaveLength(1)
  })

  it('adds a second and third exercise, renames, then removes one', async () => {
    await agent.post('/api/workouts/add-exercise').send({ exerciseId: pallof.id })
    const three = await agent.post('/api/workouts/add-exercise').send({ exerciseId: rope.id })
    expect(three.body.workout.exercises.map((e) => e.name)).toEqual(['Plank Hold', 'Pallof Press', 'Jump Rope'])
    expect(three.body.workout.name).toBe('Cardio & Core')

    const ropeRow = three.body.workout.exercises[2]
    const removed = await agent.post('/api/workouts/remove-exercise').send({ workoutExerciseId: ropeRow.workoutExerciseId })
    expect(removed.status).toBe(200)
    expect(removed.body.workout.exercises.map((e) => e.name)).toEqual(['Plank Hold', 'Pallof Press'])
    expect(removed.body.workout.name).toBe('Core Day')
  })

  it('validates exercise ids', async () => {
    expect((await agent.post('/api/workouts/add-exercise').send({ exerciseId: 999999 })).status).toBe(404)
    for (const exerciseId of ['abc', true, -1, 1.5, null, undefined]) {
      const res = await agent.post('/api/workouts/add-exercise').send({ exerciseId })
      expect(res.status, `exerciseId=${exerciseId}`).toBe(400)
    }
  })

  it('starts the workout and keeps the original start time on a second start', async () => {
    const first = await agent.post('/api/workouts/start').send({ workoutId })
    expect(first.status).toBe(200)
    expect(first.body.workout.status).toBe('in_progress')
    const second = await agent.post('/api/workouts/start').send({ workoutId })
    expect(second.body.workout.startedAt).toBe(first.body.workout.startedAt)
  })

  it('ticks and unticks a set', async () => {
    const { body } = await agent.get('/api/workouts')
    const setId = body.workout.exercises[0].setsDetail[0].id

    const tick = await agent.patch('/api/sets').send({ setId, completed: true })
    expect(tick.status).toBe(200)
    expect(tick.body.set).toEqual({ id: setId, completed: true })
    expect((await agent.get('/api/workouts')).body.workout.exercises[0].setsDetail[0].completed).toBe(true)

    const untick = await agent.patch('/api/sets').send({ setId, completed: false })
    expect(untick.body.set.completed).toBe(false)
    expect((await agent.get('/api/workouts')).body.workout.exercises[0].setsDetail[0].completed).toBe(false)
  })

  it('validates set updates', async () => {
    const { body } = await agent.get('/api/workouts')
    const setId = body.workout.exercises[0].setsDetail[0].id
    expect((await agent.patch('/api/sets').send({ setId, completed: 'yes' })).status).toBe(400)
    expect((await agent.patch('/api/sets').send({ setId: 'x', completed: true })).status).toBe(400)
    expect((await agent.patch('/api/sets').send({ setId: 999999999, completed: true })).status).toBe(404)
    expect((await agent.post('/api/sets').send({ setId, completed: true })).status).toBe(405)
  })

  it('completes the workout with a duration measured on the server', async () => {
    const { body } = await agent.get('/api/workouts')
    for (const set of body.workout.exercises.flatMap((e) => e.setsDetail)) {
      await agent.patch('/api/sets').send({ setId: set.id, completed: true })
    }
    await backdateStart(workoutId, 25)

    const res = await agent.post('/api/workouts/complete').send({ workoutId })
    expect(res.status).toBe(200)
    expect(res.body.workout.status).toBe('completed')
    expect(res.body.workout.durationMinutes).toBe(25)
    expect(res.body.streak).toBe(1)

    const today = (await agent.get('/api/workouts')).body.workout
    expect(today.status).toBe('completed')
    expect(today.exercises.flatMap((e) => e.setsDetail).every((s) => s.completed)).toBe(true)
  })

  it('a finished workout is locked', async () => {
    const { body } = await agent.get('/api/workouts')
    const setId = body.workout.exercises[0].setsDetail[0].id
    expect((await agent.post('/api/workouts/complete').send({ workoutId })).status).toBe(404)
    expect((await agent.post('/api/workouts/start').send({ workoutId })).status).toBe(404)
    expect((await agent.patch('/api/sets').send({ setId, completed: false })).status).toBe(404)
    expect((await agent.post('/api/workouts/remove-exercise').send({ workoutExerciseId: body.workout.exercises[0].workoutExerciseId })).status).toBe(404)
  })

  it('adding an exercise after finishing starts a fresh workout for today', async () => {
    const res = await agent.post('/api/workouts/add-exercise').send({ exerciseId: rope.id })
    expect(res.status).toBe(201)
    expect(res.body.workout.id).not.toBe(workoutId)
    expect(res.body.workout.status).toBe('planned')
    // the open workout now takes priority as "today's"
    expect((await agent.get('/api/workouts')).body.workout.id).toBe(res.body.workout.id)
  })

  it('removing the last exercise from an untouched plan deletes it', async () => {
    const { body } = await agent.get('/api/workouts')
    const res = await agent.post('/api/workouts/remove-exercise').send({ workoutExerciseId: body.workout.exercises[0].workoutExerciseId })
    expect(res.body.workout).toBeNull()
    // the completed workout from earlier is still there
    expect((await agent.get('/api/workouts')).body.workout).toMatchObject({ id: workoutId, status: 'completed' })
  })
})
