import { describe, expect, it } from 'vitest'
import { ringFraction, ringPercent } from '../../src/lib/rings.js'

describe('progress rings', () => {
  it('normal progress', () => {
    expect(ringFraction(2, 4)).toBe(0.5)
    expect(ringPercent(1, 3)).toBe(33)
    expect(ringPercent(4, 4)).toBe(100)
  })

  it('never goes above 100%', () => {
    expect(ringFraction(10, 4)).toBe(1)
    expect(ringPercent(300, 180)).toBe(100)
  })

  it('never shows NaN or Infinity', () => {
    const weird = [
      [0, 0],
      [5, 0],
      [NaN, 5],
      [5, NaN],
      [undefined, undefined],
      [null, 4],
      [Infinity, 4],
      [4, Infinity],
      [-3, 4],
      ['abc', 4],
    ]
    for (const [v, g] of weird) {
      const f = ringFraction(v, g)
      expect(Number.isFinite(f), `ringFraction(${v}, ${g})`).toBe(true)
      expect(f).toBeGreaterThanOrEqual(0)
      expect(f).toBeLessThanOrEqual(1)
      expect(Number.isNaN(ringPercent(v, g))).toBe(false)
    }
  })

  it('accepts numeric strings', () => {
    expect(ringPercent('3', '4')).toBe(75)
  })
})
