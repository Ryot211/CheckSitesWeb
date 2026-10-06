import { describe, expect, it } from 'vitest'
import { analyzeUrl } from './url-analyzer'

describe('analyzeUrl', () => {
  it('marca los sitios sin HTTPS', () => {
    const result = analyzeUrl('http://example.com')

    expect(result.signals.map((s) => s.id)).toContain('no-https')
  })

  it('no marca los sitios con HTTPS', () => {
    const result = analyzeUrl('https://example.com')

    expect(result.signals.map((s) => s.id)).not.toContain('no-https')
  })

  it('marca las URLs que usan una IP en lugar de un dominio', () => {
    const result = analyzeUrl('http://192.168.1.10/login')

    expect(result.signals.map((s) => s.id)).toContain('ip-address')
  })

  it('no marca las URLs con un dominio normal', () => {
    const result = analyzeUrl('https://example.com')

    expect(result.signals.map((s) => s.id)).not.toContain('ip-address')
  })
})