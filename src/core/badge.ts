export type RiskLevel = 'none' | 'low' | 'medium' | 'high'

export interface Badge {
  text: string
  color: string
}

const MEDIUM_RISK_THRESHOLD = 30
const HIGH_RISK_THRESHOLD = 60

const BADGE_COLORS: Record<RiskLevel, string> = {
  none: '#CA8A04',
  low: '#CA8A04',
  medium: '#EA580C',
  high: '#DC2626',
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= HIGH_RISK_THRESHOLD) {
    return 'high'
  }

  if (score >= MEDIUM_RISK_THRESHOLD) {
    return 'medium'
  }

  return score > 0 ? 'low' : 'none'
}

export function getBadge(score: number): Badge {
  return {
    text: score > 0 ? String(score) : '',
    color: BADGE_COLORS[getRiskLevel(score)],
  }
}
