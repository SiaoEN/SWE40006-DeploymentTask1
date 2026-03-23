import './assets/main.css'

import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Wrap App in a Root component that sets up IPC listeners
function Root() {
  useEffect(() => {
    const onUpdateAvailable = (_: any, data: { version: string }) => {
      console.log('[Update] Update available:', data.version)
      alert(`Update to v${data.version} is available. Downloading...`)
    }

    const onUpdateDownloaded = (_: any, data: { version: string }) => {
      console.log('[Update] Update downloaded:', data.version)
      alert(`Update to v${data.version} downloaded. You will be prompted to install.`)
    }

    const onUpdateError = (_: any, data: { error: string }) => {
      console.error('[Update] Error:', data.error)
      alert(`Update failed: ${data.error}`)
    }

    window.electron.ipcRenderer.on('update_available', onUpdateAvailable)
    window.electron.ipcRenderer.on('update_downloaded', onUpdateDownloaded)
    window.electron.ipcRenderer.on('update_error', onUpdateError)

    // Cleanup listeners when component unmounts
    return () => {
      window.electron.ipcRenderer.removeListener('update_available', onUpdateAvailable)
      window.electron.ipcRenderer.removeListener('update_downloaded', onUpdateDownloaded)
      window.electron.ipcRenderer.removeListener('update_error', onUpdateError)
    }
  }, [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
