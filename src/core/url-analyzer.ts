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

  const score = Math.min(
    100,
    signals.reduce((sum, signal) => sum + signal.weight, 0),
  )

  return { score, signals }
}