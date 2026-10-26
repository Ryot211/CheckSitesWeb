import { describe, expect, it } from 'vitest'
import { analyzePage, type PageFacts } from './page-analyzer'

function buildFacts(overrides: Partial<PageFacts> = {}): PageFacts {
  return {
    passwordFieldCount: 0,
    cardFieldCount: 0,
    formActions: [],
    ...overrides,
  }
}

describe('analyzePage', () => {
  it('no marca nada en una página sin formularios', () => {
    const result = analyzePage(buildFacts(), 'https://example.com')

    expect(result.signals).toEqual([])
  })

  it('marca las páginas que piden contraseña', () => {
    const result = analyzePage(
      buildFacts({ passwordFieldCount: 1 }),
      'https://example.com',
    )

    expect(result.signals.map((s) => s.id)).toContain('password-field')
  })

  it('marca las páginas que piden número de tarjeta', () => {
    const result = analyzePage(
      buildFacts({ cardFieldCount: 1 }),
      'https://example.com',
    )

    expect(result.signals.map((s) => s.id)).toContain('card-field')
  })

  it('marca los formularios que envían datos a otro dominio', () => {
    const result = analyzePage(
      buildFacts({ formActions: ['https://recolector.xyz/guardar'] }),
      'https://banco-ejemplo.com/login',
    )

    expect(result.signals.map((s) => s.id)).toContain('external-form')
  })

  it('no marca los formularios que envían datos al mismo dominio', () => {
    const result = analyzePage(
      buildFacts({ formActions: ['https://auth.banco-ejemplo.com/login'] }),
      'https://www.banco-ejemplo.com/login',
    )

    expect(result.signals.map((s) => s.id)).not.toContain('external-form')
  })
})
