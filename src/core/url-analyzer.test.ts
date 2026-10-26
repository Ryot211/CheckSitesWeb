import { describe, expect, it } from 'vitest'
import { analyzeUrl } from './url-analyzer'

describe('analyzeUrl', () => {
  it('marca los sitios con una extensión de dominio de riesgo', () => {
    const result = analyzeUrl('https://ofertas.xyz')

    expect(result.signals.map((s) => s.id)).toContain('suspicious-tld')
  })
  it('No marca los sitios con una extension de dominio ', () => {
    const result = analyzeUrl('https://apple.com')

    expect(result.signals.map((s) => s.id)).not.toContain('suspicious-tld')
  })

  it('marca los sitios alojados en un hosting gratuito', () => {
    const result = analyzeUrl('https://mi-tienda.vercel.app')

    expect(result.signals.map((s) => s.id)).toContain('free-hosting')
  })

  it('marca los sitios de GitHub Pages', () => {
    const result = analyzeUrl('https://usuario.github.io/login')

    expect(result.signals.map((s) => s.id)).toContain('free-hosting')
  })

  it('no marca los sitios con dominio propio', () => {
    const result = analyzeUrl('https://example.com')

    expect(result.signals.map((s) => s.id)).not.toContain('free-hosting')
  })
  it('marca dominios con una letra cambiada por un número', () => {
    const result = analyzeUrl('https://paypa1.com')

    expect(result.signals.map((s) => s.id)).toContain('typosquatting')
  })

  it('marca dominios con una letra de más', () => {
    const result = analyzeUrl('https://gooogle.com')

    expect(result.signals.map((s) => s.id)).toContain('typosquatting')
  })

  it('marca dominios que reemplazan letras por números parecidos', () => {
    const result = analyzeUrl('https://faceb00k.com')

    expect(result.signals.map((s) => s.id)).toContain('typosquatting')
  })

  it('no marca el dominio real de la marca', () => {
    const result = analyzeUrl('https://paypal.com')

    expect(result.signals.map((s) => s.id)).not.toContain('typosquatting')
  })

  it('no marca dominios que no se parecen a ninguna marca', () => {
    const result = analyzeUrl('https://amazon.com')

    expect(result.signals.map((s) => s.id)).not.toContain('typosquatting')
  })
  it('marca los sitios que usan una marca conocida en un dominio ajeno', () => {
    const result = analyzeUrl('https://www.paypal.com.cuenta-segura.xyz/login')

    expect(result.signals.map((s) => s.id)).toContain('brand-impersonation')
  })

  it('no marca el dominio oficial de la marca', () => {
    const result = analyzeUrl('https://www.paypal.com/signin')

    expect(result.signals.map((s) => s.id)).not.toContain('brand-impersonation')
  })

  it('no marca los subdominios del dominio oficial', () => {
    const result = analyzeUrl('https://checkout.paypal.com/pay')

    expect(result.signals.map((s) => s.id)).not.toContain('brand-impersonation')
  })
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

  it('marca las URLs que ocultan el destino con un @', () => {
    const result = analyzeUrl('https://www.paypal.com@cuenta-segura.xyz/login')

    expect(result.signals.map((s) => s.id)).toContain('credentials-in-url')
  })

  it('no marca las URLs sin @', () => {
    const result = analyzeUrl('https://www.paypal.com/signin')

    expect(result.signals.map((s) => s.id)).not.toContain('credentials-in-url')
  })

  it('marca el @ aunque el dominio tenga una extensión común', () => {
    const result = analyzeUrl('https://www.paypal.com@cuenta-segura.com/login')

    expect(result.signals.map((s) => s.id)).toContain('credentials-in-url')
  })

  it('marca los dominios con palabras gancho', () => {
    const result = analyzeUrl('https://secure-login-banco.com')

    expect(result.signals.map((s) => s.id)).toContain('suspicious-keyword')
  })

  it('marca las palabras gancho en español', () => {
    const result = analyzeUrl('https://verificar-cuenta.com')

    expect(result.signals.map((s) => s.id)).toContain('suspicious-keyword')
  })

  it('no marca las palabras gancho que están en la ruta', () => {
    const result = analyzeUrl('https://www.google.com/login')

    expect(result.signals.map((s) => s.id)).not.toContain('suspicious-keyword')
  })

  it('marca los dominios con caracteres de otro alfabeto', () => {
    // а es la "а" cirílica: se ve igual que la "a" latina
    const result = analyzeUrl('https://аpple.com')

    expect(result.signals.map((s) => s.id)).toContain('punycode')
  })

  it('no marca los dominios con letras normales', () => {
    const result = analyzeUrl('https://apple.com')

    expect(result.signals.map((s) => s.id)).not.toContain('punycode')
  })

  it('marca los dominios con exceso de guiones', () => {
    const result = analyzeUrl('https://tienda-de-ofertas-online.com')

    expect(result.signals.map((s) => s.id)).toContain('many-hyphens')
  })

  it('no marca los dominios con pocos guiones', () => {
    const result = analyzeUrl('https://mi-tienda-online.com')

    expect(result.signals.map((s) => s.id)).not.toContain('many-hyphens')
  })

  it('no cuenta los guiones del prefijo de punycode', () => {
    const result = analyzeUrl('https://аpple.com')

    expect(result.signals.map((s) => s.id)).not.toContain('many-hyphens')
  })
})
