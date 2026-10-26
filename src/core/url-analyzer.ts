import { getDomain, getDomainWithoutSuffix, getPublicSuffix } from 'tldts'
import { levenshtein } from './levenshtein'
import { calculateScore } from './score'

export interface Signal {
  id: string
  weight: number
  message: string
}

export interface UrlAnalysis {
  score: number
  signals: Signal[]
}

interface ParsedUrl {
  protocol: string
  hostname: string
  registrableDomain: string
  domainName: string
  publicSuffix: string
  username: string
}

function parseUrl(rawUrl: string): ParsedUrl {
  const url = new URL(rawUrl)

  return {
    protocol: url.protocol,
    hostname: url.hostname,
    publicSuffix: getPublicSuffix(url.hostname) ?? '',
    registrableDomain: getDomain(url.hostname) ?? '',
    domainName: getDomainWithoutSuffix(url.hostname) ?? '',
    username: url.username,
  }
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

function findImpersonatedBrand(parsed: ParsedUrl) {
  return KNOWN_BRANDS.find(
    (brand) =>
      parsed.hostname.includes(brand.name) &&
      !brand.domains.includes(parsed.registrableDomain),
  )
}

const HOMOGLYPHS: Record<string, string> = {
  '0': 'o',
  '1': 'l',
  '3': 'e',
  '4': 'a',
  '5': 's',
  rn: 'm',
  vv: 'w',
}

function normalizeHomoglyphs(text: string): string {
  let normalized = text

  for (const [lookalike, original] of Object.entries(HOMOGLYPHS)) {
    normalized = normalized.replaceAll(lookalike, original)
  }

  return normalized
}

function findTyposquattedBrand(parsed: ParsedUrl) {
  if (!parsed.domainName) {
    return undefined
  }

  const normalizedName = normalizeHomoglyphs(parsed.domainName)

  return KNOWN_BRANDS.find(
    (brand) =>
      !brand.domains.includes(parsed.registrableDomain) &&
      levenshtein(normalizedName, brand.name) <= 2,
  )
}

const FREE_HOSTING_DOMAINS = [
  'vercel.app',
  'netlify.app',
  'github.io',
  'pages.dev',
  'web.app',
  'firebaseapp.com',
  'onrender.com',
]

function isFreeHosting(registrableDomain: string): boolean {
  return FREE_HOSTING_DOMAINS.includes(registrableDomain)
}

const SUSPICIOUS_TLDS = ['xyz', 'top', 'click', 'zip', 'tk', 'buzz']

function isSuspiciousTld(publicSuffix: string): boolean {
  return SUSPICIOUS_TLDS.includes(publicSuffix)
}

const SUSPICIOUS_KEYWORDS = [
  'login',
  'signin',
  'verify',
  'secure',
  'account',
  'update',
  'password',
  'wallet',
  'verificar',
  'cuenta',
  'seguro',
  'actualizar',
  'clave',
  'banca',
]

function findSuspiciousKeyword(hostname: string) {
  return SUSPICIOUS_KEYWORDS.find((keyword) => hostname.includes(keyword))
}

function isPunycode(hostname: string): boolean {
  return hostname.includes('xn--')
}

const MAX_HYPHENS = 2

function hasManyHyphens(hostname: string): boolean {
  const hyphenCount = hostname.replaceAll('xn--', '').split('-').length - 1

  return hyphenCount > MAX_HYPHENS
}

export function analyzeUrl(rawUrl: string): UrlAnalysis {
  const parsed = parseUrl(rawUrl)
  const signals: Signal[] = []

  if (parsed.protocol === 'http:') {
    signals.push({
      id: 'no-https',
      weight: 10,
      message: 'El sitio no usa HTTPS.',
    })
  }

  if (isIpAddress(parsed.hostname)) {
    signals.push({
      id: 'ip-address',
      weight: 30,
      message:
        'El sitio usa una dirección IP en lugar de un nombre de dominio.',
    })
  }

  const impersonatedBrand = findImpersonatedBrand(parsed)

  if (impersonatedBrand) {
    signals.push({
      id: 'brand-impersonation',
      weight: 50,
      message: `El sitio menciona "${impersonatedBrand.name}" pero no pertenece a su dominio oficial.`,
    })
  }

  const typosquattedBrand = findTyposquattedBrand(parsed)

  if (typosquattedBrand) {
    signals.push({
      id: 'typosquatting',
      weight: 40,
      message: `El dominio se parece sospechosamente a "${typosquattedBrand.name}".`,
    })
  }

  if (isFreeHosting(parsed.registrableDomain)) {
    signals.push({
      id: 'free-hosting',
      weight: 15,
      message: 'El sitio está alojado en un servicio de hosting gratuito.',
    })
  }

  if (isSuspiciousTld(parsed.publicSuffix)) {
    signals.push({
      id: 'suspicious-tld',
      weight: 15,
      message: 'El sitio usa una extensión de dominio frecuente en fraudes.',
    })
  }

  if (parsed.username !== '') {
    signals.push({
      id: 'credentials-in-url',
      weight: 35,
      message: 'La URL oculta el destino real usando un "@".',
    })
  }

  const suspiciousKeyword = findSuspiciousKeyword(parsed.hostname)

  if (suspiciousKeyword) {
    signals.push({
      id: 'suspicious-keyword',
      weight: 20,
      message: `El dominio contiene la palabra "${suspiciousKeyword}", frecuente en sitios fraudulentos.`,
    })
  }

  if (isPunycode(parsed.hostname)) {
    signals.push({
      id: 'punycode',
      weight: 25,
      message:
        'El dominio usa caracteres especiales que pueden imitar letras normales.',
    })
  }

  if (hasManyHyphens(parsed.hostname)) {
    signals.push({
      id: 'many-hyphens',
      weight: 15,
      message:
        'El dominio tiene demasiados guiones, algo común en sitios fraudulentos.',
    })
  }

  return { score: calculateScore(signals), signals }
}
