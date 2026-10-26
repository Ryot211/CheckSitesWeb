import { useEffect, useState } from 'react'
import { RiskReport } from './components/RiskReport'
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

  return (
    <main className="popup">
      <header className="pill popup-header">
        <img src="/icons/icon-32.png" alt="" width={18} height={18} />
        <span>Detector de sitios falsos</span>
      </header>

      {url === null && <p className="glass status">Analizando...</p>}

      {url !== null && !url.startsWith('http') && (
        <p className="glass status">
          Esta página es interna del navegador y no se puede analizar.
        </p>
      )}

      {url !== null && url.startsWith('http') && (
        <RiskReport url={url} {...getAnalysis(url, pageFacts)} />
      )}

      <footer className="pill popup-footer">
        Análisis local: nada sale de tu navegador.
      </footer>
    </main>
  )
}

function getAnalysis(url: string, pageFacts: PageFacts | null) {
  const signals = [
    ...analyzeUrl(url).signals,
    ...(pageFacts ? analyzePage(pageFacts, url).signals : []),
  ]

  return { signals, score: calculateScore(signals) }
}

export default App
