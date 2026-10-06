import { useEffect, useState } from 'react'
import { analyzeUrl } from './core/url-analyzer'

function App() {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      setUrl(tab?.url ?? '')
    })
  }, [])

  if (url === null) {
    return (
      <main>
        <p>Analizando...</p>
      </main>
    )
  }

  if (!url.startsWith('http')) {
    return (
      <main>
        <h1>Detector de sitios falsos</h1>
        <p>Esta página no se puede analizar.</p>
      </main>
    )
  }

  const analysis = analyzeUrl(url)

  return (
    <main>
      <h1>Detector de sitios falsos</h1>
      <p className="url">{url}</p>
      <p>Riesgo: {analysis.score}/100</p>
      {analysis.signals.length === 0 ? (
        <p>No se detectaron señales sospechosas.</p>
      ) : (
        <ul>
          {analysis.signals.map((signal) => (
            <li key={signal.id}>{signal.message}</li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
