import { useEffect, useState } from 'react'

function App() {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      setUrl(tab?.url ?? 'Unavailable')
    })
  }, [])

  return (
    <main>
      <h1>Fake Site Detector</h1>
      <p>{url ?? 'Loading...'}</p>
    </main>
  )
}

export default App