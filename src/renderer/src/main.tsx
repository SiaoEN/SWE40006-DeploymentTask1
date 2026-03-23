import './assets/main.css'

import { JSX, StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

function Root(): JSX.Element {
  useEffect(() => {
    const unsubscribeAvailable = window.api.updater.onUpdateAvailable((data) => {
      console.log('[Update] Update available:', data.version)
      alert(`Update to v${data.version} is available. Downloading...`)
    })

    const unsubscribeProgress = window.api.updater.onDownloadProgress((data) => {
      console.log(`[Update] Download progress: ${data.percent.toFixed(1)}%`)
    })

    const unsubscribeDownloaded = window.api.updater.onUpdateDownloaded((data) => {
      console.log('[Update] Update downloaded:', data.version)
      alert(`Update to v${data.version} downloaded. You can install it from the app prompt.`)
    })

    const unsubscribeError = window.api.updater.onUpdateError((data) => {
      console.error('[Update] Error:', data.error)
      alert(`Update failed: ${data.error}`)
    })

    return () => {
      unsubscribeAvailable()
      unsubscribeProgress()
      unsubscribeDownloaded()
      unsubscribeError()
    }
  }, [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
