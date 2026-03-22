import './assets/main.css'

import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Wrap App in a Root component that sets up IPC listeners
function Root() {
  useEffect(() => {
    const onUpdateAvailable = () => {
      alert('A new update is available. Downloading now...')
    }

    const onUpdateDownloaded = () => {
      alert('Update downloaded. It will install on restart.')
    }

    window.electron.ipcRenderer.on('update_available', onUpdateAvailable)
    window.electron.ipcRenderer.on('update_downloaded', onUpdateDownloaded)

    // Cleanup listeners when component unmounts
    return () => {
      window.electron.ipcRenderer.removeListener('update_available', onUpdateAvailable)
      window.electron.ipcRenderer.removeListener('update_downloaded', onUpdateDownloaded)
    }
  }, [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
