import { describe, expect, it } from 'vitest'
import { analyzeUrl } from './url-analyzer'

describe('analyzeUrl', () => {
  it('flags sites without HTTPS', () => {
    const result = analyzeUrl('http://example.com')

    expect(result.signals.map((s) => s.id)).toContain('no-https')
  })

  it('does not flag sites with HTTPS', () => {
    const result = analyzeUrl('https://example.com')

    expect(result.signals.map((s) => s.id)).not.toContain('no-https')
  })
})