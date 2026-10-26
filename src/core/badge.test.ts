import { describe, expect, it } from 'vitest'
import { getBadge, getRiskLevel } from './badge'

describe('getRiskLevel', () => {
  it('no indica riesgo con puntaje 0', () => {
    expect(getRiskLevel(0)).toBe('none')
  })

  it('indica riesgo bajo por debajo de 30', () => {
    expect(getRiskLevel(29)).toBe('low')
  })

  it('indica riesgo medio desde 30', () => {
    expect(getRiskLevel(30)).toBe('medium')
  })

  it('indica riesgo alto desde 60', () => {
    expect(getRiskLevel(60)).toBe('high')
  })
})

describe('getBadge', () => {
  it('no muestra insignia si no hay riesgo', () => {
    expect(getBadge(0).text).toBe('')
  })

  it('muestra el puntaje como texto', () => {
    expect(getBadge(45).text).toBe('45')
  })

  it('usa amarillo para el riesgo bajo', () => {
    expect(getBadge(10).color).toBe('#CA8A04')
  })

  it('usa naranja para el riesgo medio', () => {
    expect(getBadge(30).color).toBe('#EA580C')
  })

  it('usa rojo para el riesgo alto', () => {
    expect(getBadge(60).color).toBe('#DC2626')
  })
})
