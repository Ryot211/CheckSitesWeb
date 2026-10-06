export interface Signal {
  id: string
  weight: number
  message: string
}

export interface UrlAnalysis {
  score: number
  signals: Signal[]
}

export function analyzeUrl(rawUrl: string): UrlAnalysis {
  const url = new URL(rawUrl)
  const signals: Signal[] = []

  if (url.protocol === 'http:') {
    signals.push({
      id: 'no-https',
      weight: 10,
      message: 'The site does not use HTTPS.',
    })
  }

  const score = Math.min(
    100,
    signals.reduce((sum, signal) => sum + signal.weight, 0),
  )

  return { score, signals }
}