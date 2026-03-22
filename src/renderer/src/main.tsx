import './assets/main.css'

import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ipcRenderer } from 'electron'
import App from './App'

// Wrap App in a Root component that sets up IPC listeners
function Root() {
  useEffect(() => {
    ipcRenderer.on('update_available', () => {
      alert('A new update is available. Downloading now...')
    })

    ipcRenderer.on('update_downloaded', () => {
      alert('Update downloaded. It will install on restart.')
    })

    // Cleanup listeners when component unmounts
    return () => {
      ipcRenderer.removeAllListeners('update_available')
      ipcRenderer.removeAllListeners('update_downloaded')
    }
  }, [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
