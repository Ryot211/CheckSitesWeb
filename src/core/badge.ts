export interface Badge {
  text: string
  color: string
}

const MEDIUM_RISK_THRESHOLD = 30
const HIGH_RISK_THRESHOLD = 60

const LOW_RISK_COLOR = '#CA8A04'
const MEDIUM_RISK_COLOR = '#EA580C'
const HIGH_RISK_COLOR = '#DC2626'

function getRiskColor(score: number): string {
  if (score >= HIGH_RISK_THRESHOLD) {
    return HIGH_RISK_COLOR
  }

  if (score >= MEDIUM_RISK_THRESHOLD) {
    return MEDIUM_RISK_COLOR
  }

  return LOW_RISK_COLOR
}

export function getBadge(score: number): Badge {
  return {
    text: score > 0 ? String(score) : '',
    color: getRiskColor(score),
  }
}
