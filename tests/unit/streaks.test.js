import { afterEach, describe, expect, it, vi } from 'vitest'
import { computeStreaks } from '../../api/_lib/workouts.js'
import { addDays, localDate, weekStart, weekdayShort } from '../../api/_lib/time.js'

describe('computeStreaks (fake dates)', () => {
  const today = '2026-03-10'

  it('no workouts → streak 0', () => {
    expect(computeStreaks([], today)).toEqual({ current: 0, best: 0 })
  })

  it('3 days in a row ending today → streak 3', () => {
    expect(computeStreaks(['2026-03-08', '2026-03-09', '2026-03-10'], today)).toEqual({ current: 3, best: 3 })
  })

  it('a workout today plus yesterday → streak 2', () => {
    expect(computeStreaks(['2026-03-09', '2026-03-10'], today).current).toBe(2)
  })

  it('streak is still alive the morning after (trained yesterday, not yet today)', () => {
    expect(computeStreaks(['2026-03-07', '2026-03-08', '2026-03-09'], today).current).toBe(3)
  })

  it('a missed day resets the streak', () => {
    // trained 7th, 8th, then skipped the 9th → nothing counts on the 10th
    expect(computeStreaks(['2026-03-07', '2026-03-08'], today)).toEqual({ current: 0, best: 2 })
    // trained today, missed yesterday, trained the two days before → only today counts
    expect(computeStreaks(['2026-03-07', '2026-03-08', '2026-03-10'], today)).toEqual({ current: 1, best: 2 })
  })

  it('counts two workouts on the same day once', () => {
    expect(computeStreaks(['2026-03-10', '2026-03-10', '2026-03-09'], today).current).toBe(2)
  })

  it('works with unsorted input', () => {
    expect(computeStreaks(['2026-03-10', '2026-03-08', '2026-03-09'], today).current).toBe(3)
  })

  it('crosses month, year and leap-day boundaries', () => {
    expect(computeStreaks(['2026-12-31', '2027-01-01'], '2027-01-01').current).toBe(2)
    expect(computeStreaks(['2028-02-28', '2028-02-29', '2028-03-01'], '2028-03-01').current).toBe(3)
    expect(computeStreaks(['2026-02-28', '2026-03-01'], '2026-03-01').current).toBe(2) // 2026 has no Feb 29
  })

  it('best streak is the longest run, and future dates are ignored', () => {
    const days = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-03-09', '2026-03-10', '2026-03-12']
    expect(computeStreaks(days, today)).toEqual({ current: 2, best: 4 })
  })
})

describe('date helpers', () => {
  afterEach(() => vi.useRealTimers())

  it('localDate respects the user’s time zone', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-10T22:30:00Z'))
    expect(localDate('UTC')).toBe('2026-03-10')
    expect(localDate('Asia/Dubai')).toBe('2026-03-11') // UTC+4, already tomorrow
    expect(localDate('America/Los_Angeles')).toBe('2026-03-10')
  })

  it('addDays and weekStart (Monday)', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(weekStart('2026-10-25')).toBe('2026-10-19') // Sunday → previous Monday
    expect(weekStart('2026-10-19')).toBe('2026-10-19') // Monday → itself
    expect(weekdayShort('2026-10-25')).toBe('Sun')
  })
})
