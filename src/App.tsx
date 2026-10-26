import { useEffect, useState } from 'react'
import { collectPageFacts } from './content/collect-page-facts'
import { analyzePage, type PageFacts } from './core/page-analyzer'
import { calculateScore } from './core/score'
import { analyzeUrl } from './core/url-analyzer'

function App() {
  const [url, setUrl] = useState<string | null>(null)
  const [pageFacts, setPageFacts] = useState<PageFacts | null>(null)

  useEffect(() => {
    async function inspectActiveTab() {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
      const tabUrl = tab?.url ?? ''

      setUrl(tabUrl)

      if (tab?.id === undefined || !tabUrl.startsWith('http')) {
        return
      }

      try {
        const [injection] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: collectPageFacts,
        })

        setPageFacts(injection?.result ?? null)
      } catch {
        setPageFacts(null)
      }
    }

    inspectActiveTab()
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

  const signals = [
    ...analyzeUrl(url).signals,
    ...(pageFacts ? analyzePage(pageFacts, url).signals : []),
  ]
  const score = calculateScore(signals)

  return (
    <main>
      <h1>Detector de sitios falsos</h1>
      <p className="url">{url}</p>
      <p>Riesgo: {score}/100</p>
      {signals.length === 0 ? (
        <p>No se detectaron señales sospechosas.</p>
      ) : (
        <ul>
          {signals.map((signal) => (
            <li key={signal.id}>{signal.message}</li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
