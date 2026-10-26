import { describe, expect, it } from 'vitest'
import { calculateScore } from './score'

describe('calculateScore', () => {
  it('suma los pesos de las señales', () => {
    const score = calculateScore([
      { id: 'a', weight: 10, message: '' },
      { id: 'b', weight: 25, message: '' },
    ])

    expect(score).toBe(35)
  })

  it('no supera 100', () => {
    const score = calculateScore([
      { id: 'a', weight: 60, message: '' },
      { id: 'b', weight: 70, message: '' },
    ])

    expect(score).toBe(100)
  })

  it('devuelve 0 si no hay señales', () => {
    expect(calculateScore([])).toBe(0)
  })
})
