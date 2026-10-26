import { getRiskLevel, type RiskLevel } from '../core/badge'
import type { Signal } from '../core/url-analyzer'

interface RiskReportProps {
  url: string
  score: number
  signals: Signal[]
}

const LEVEL_LABELS: Record<RiskLevel, string> = {
  none: 'Sin riesgo',
  low: 'Riesgo bajo',
  medium: 'Riesgo medio',
  high: 'Riesgo alto',
}

export function RiskReport({ url, score, signals }: RiskReportProps) {
  const level = getRiskLevel(score)
  const hostname = new URL(url).hostname
  const sortedSignals = [...signals].sort((a, b) => b.weight - a.weight)
  const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0)

  return (
    <>
      <section className={`glass verdict verdict--${level}`} aria-live="polite">
        <p className="site-host">{hostname}</p>
        <p className="site-url" title={url}>
          {url}
        </p>

        <div className="verdict-row">
          <p className="verdict-label">{LEVEL_LABELS[level]}</p>
          <p className="verdict-score">
            {score}
            <span>/100</span>
          </p>
        </div>

        <div
          className="meter"
          role="meter"
          aria-label="Puntaje de riesgo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
        >
          <span className="meter-fill" style={{ width: `${score}%` }} />
        </div>
      </section>

      {sortedSignals.length === 0 ? (
        <p className="glass all-clear">
          No encontramos señales de riesgo en la dirección ni en el contenido de
          esta página.
        </p>
      ) : (
        <section className="glass reasons">
          <h2>Por qué</h2>
          <ul>
            {sortedSignals.map((signal) => (
              <li key={signal.id}>
                <span>{signal.message}</span>
                <span className="reason-weight">+{signal.weight}</span>
              </li>
            ))}
          </ul>
          {totalWeight > score && (
            <p className="reasons-note">
              Las señales suman {totalWeight}, pero el puntaje se limita a 100.
            </p>
          )}
        </section>
      )}
    </>
  )
}
