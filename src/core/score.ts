import type { Signal } from './url-analyzer'

const MAX_SCORE = 100

export function calculateScore(signals: Signal[]): number {
  const total = signals.reduce((sum, signal) => sum + signal.weight, 0)

  return Math.min(MAX_SCORE, total)
}
