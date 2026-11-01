import { describe, expect, it } from 'vitest'
import { addDays, localDate, weekStart } from '../../api/_lib/time.js'
import { backdateStart, exerciseByName, hasDb, newUser, seedCompletedWorkout } from '../helpers.js'

// Tests run in UTC (no x-timezone header), so dates line up with the seeded rows.
const today = () => localDate('UTC')

async function finishWorkoutToday(agent, minutes) {
  const plank = await exerciseByName(agent, 'Plank Hold')
  const { body } = await agent.post('/api/workouts/add-exercise').send({ exerciseId: plank.id })
  await agent.post('/api/workouts/start').send({ workoutId: body.workout.id })
  for (const s of body.workout.exercises[0].setsDetail) await agent.patch('/api/sets').send({ setId: s.id, completed: true })
  await backdateStart(body.workout.id, minutes)
  const done = await agent.post('/api/workouts/complete').send({ workoutId: body.workout.id })
  expect(done.status).toBe(200)
}

function checkShape(d) {
  expect(d.activity).toHaveLength(7)
  expect(d.activity.at(-1).date).toBe(today())
  expect(d.activity[0].date).toBe(addDays(today(), -6))
  d.activity.forEach((day, i) => {
    expect(day.date).toBe(addDays(today(), i - 6))
    expect(Number.isInteger(day.minutes)).toBe(true)
    expect(day.day).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/)
  })
  for (const r of Object.values(d.rings)) {
    expect(Number.isFinite(r.value)).toBe(true)
    expect(r.goal).toBeGreaterThan(0)
  }
}

describe.skipIf(!hasDb)('/api/dashboard', () => {
  it('brand-new user: streak 0, empty 7-day chart, zeroed rings', async () => {
    const { agent } = await newUser({ fullName: 'Fresh Starter', weeklyGoalWorkouts: 4, weeklyGoalMinutes: 150 })
    const res = await agent.get('/api/dashboard')
    expect(res.status).toBe(200)
    const d = res.body
    checkShape(d)
    expect(d.firstName).toBe('Fresh')
    expect(d.today).toBeNull()
    expect(d.streak).toEqual({ current: 0, best: 0 })
    expect(d.activity.every((x) => x.minutes === 0 && x.workouts === 0)).toBe(true)
    expect(d.rings).toEqual({
      workouts: { value: 0, goal: 4 },
      minutes: { value: 0, goal: 150 },
      goals: { value: 0, goal: 3 },
    })
  })

  it('3 days in a row (two seeded + one finished today) → streak 3, chart and rings match', async () => {
    const { agent, user } = await newUser({ weeklyGoalWorkouts: 2, weeklyGoalMinutes: 30 })
    await seedCompletedWorkout(user.id, addDays(today(), -2), 20)
    await seedCompletedWorkout(user.id, addDays(today(), -1), 15)
    await finishWorkoutToday(agent, 40)

    const d = (await agent.get('/api/dashboard')).body
    checkShape(d)
    expect(d.streak).toEqual({ current: 3, best: 3 })
    expect(d.activity.slice(-3).map((x) => x.minutes)).toEqual([20, 15, 40])
    expect(d.activity.slice(-3).map((x) => x.workouts)).toEqual([1, 1, 1])
    expect(d.today).toMatchObject({ status: 'completed', durationMinutes: 40, doneSets: 3, totalSets: 3 })

    // Only days since Monday count toward "this week".
    const monday = weekStart(today())
    const thisWeek = [
      [addDays(today(), -2), 20],
      [addDays(today(), -1), 15],
      [today(), 40],
    ].filter(([date]) => date >= monday)
    const minutes = thisWeek.reduce((s, [, m]) => s + m, 0)
    expect(d.rings.workouts).toEqual({ value: thisWeek.length, goal: 2 })
    expect(d.rings.minutes).toEqual({ value: minutes, goal: 30 })
    const expectedGoals = Number(thisWeek.length >= 2) + Number(minutes >= 30) + 1 // + trained today
    expect(d.rings.goals).toEqual({ value: expectedGoals, goal: 3 })

    expect((await agent.get('/api/auth/me')).body.stats).toEqual({ workoutsCompleted: 3, streak: 3 })
  })

  it('a workout today plus yesterday → streak 2', async () => {
    const { agent, user } = await newUser()
    await seedCompletedWorkout(user.id, addDays(today(), -1), 30)
    await finishWorkoutToday(agent, 10)
    expect((await agent.get('/api/dashboard')).body.streak.current).toBe(2)
  })

  it('a missed day resets the streak (best streak is remembered)', async () => {
    const { agent, user } = await newUser()
    // trained 4 and 3 days ago, skipped 2 days ago, trained yesterday
    for (const n of [-4, -3, -1]) await seedCompletedWorkout(user.id, addDays(today(), n), 20)
    const d = (await agent.get('/api/dashboard')).body
    expect(d.streak).toEqual({ current: 1, best: 2 })
    expect(d.activity.find((x) => x.date === addDays(today(), -2)).minutes).toBe(0)
  })

  it('trend compares the last 7 days with the 7 before', async () => {
    const { agent, user } = await newUser()
    await seedCompletedWorkout(user.id, addDays(today(), -10), 30)
    await seedCompletedWorkout(user.id, addDays(today(), -1), 45)
    const d = (await agent.get('/api/dashboard')).body
    expect(d.activityTrend).toEqual({ last7: 45, prev7: 30 })
    expect(d.activity.reduce((s, x) => s + x.minutes, 0)).toBe(45) // 10 days ago is off the chart
  })

  it('beating a goal reports the real value; the UI caps the ring at 100%', async () => {
    const { agent, user } = await newUser({ weeklyGoalWorkouts: 1, weeklyGoalMinutes: 30 })
    await seedCompletedWorkout(user.id, today(), 60)
    await finishWorkoutToday(agent, 500) // left running for ages: saved duration is capped at 240
    const d = (await agent.get('/api/dashboard')).body
    expect(d.rings.workouts).toEqual({ value: 2, goal: 1 })
    expect(d.rings.minutes).toEqual({ value: 300, goal: 30 })
    expect(d.rings.goals).toEqual({ value: 3, goal: 3 })
    const { ringPercent } = await import('../../src/lib/rings.js')
    expect(ringPercent(d.rings.workouts.value, d.rings.workouts.goal)).toBe(100)
    expect(ringPercent(d.rings.minutes.value, d.rings.minutes.goal)).toBe(100)
  })
})
