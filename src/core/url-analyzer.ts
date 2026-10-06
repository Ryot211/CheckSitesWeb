import { getDomain } from "tldts"

export interface Signal {
  id: string
  weight: number
  message: string
}

export interface UrlAnalysis {
  score: number
  signals: Signal[]
}

const IPV4_PATTERN = /^\d{1,3}(\.\d{1,3}){3}$/

function isIpAddress(hostname: string): boolean {
  return IPV4_PATTERN.test(hostname) || hostname.startsWith('[')
}

const KNOWN_BRANDS = [
  { name: 'paypal', domains: ['paypal.com'] },
  { name: 'google', domains: ['google.com'] },
  { name: 'facebook', domains: ['facebook.com'] },
]

function findImpersonatedBrand(hostname: string) {
  const registrableDomain = getDomain(hostname) ?? ''

  return KNOWN_BRANDS.find(
    (brand) =>
      hostname.includes(brand.name) &&
      !brand.domains.includes(registrableDomain),
  )
}
export function analyzeUrl(rawUrl: string): UrlAnalysis {
  const url = new URL(rawUrl)
  const signals: Signal[] = []

  if (url.protocol === 'http:') {
    signals.push({
      id: 'no-https',
      weight: 10,
      message: 'El sitio no usa HTTPS.',
    })
  }

  if (isIpAddress(url.hostname)) {
    signals.push({
      id: 'ip-address',
      weight: 30,
      message: 'El sitio usa una dirección IP en lugar de un nombre de dominio.',
    })
  }
    const impersonatedBrand = findImpersonatedBrand(url.hostname)

  if (impersonatedBrand) {
    signals.push({
      id: 'brand-impersonation',
      weight: 50,
      message: `El sitio menciona "${impersonatedBrand.name}" pero no pertenece a su dominio oficial.`,
    })
  }

  const score = Math.min(
    100,
    signals.reduce((sum, signal) => sum + signal.weight, 0),
  )

  return { score, signals }
}