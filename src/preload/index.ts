import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  updater: {
    onUpdateAvailable: (callback: (data: { version: string }) => void) => {
      const listener = (_event: IpcRendererEvent, data: { version: string }) => callback(data)
      ipcRenderer.on('update_available', listener)
      return () => ipcRenderer.removeListener('update_available', listener)
    },
    onUpdateDownloaded: (callback: (data: { version: string }) => void) => {
      const listener = (_event: IpcRendererEvent, data: { version: string }) => callback(data)
      ipcRenderer.on('update_downloaded', listener)
      return () => ipcRenderer.removeListener('update_downloaded', listener)
    },
    onUpdateError: (callback: (data: { error: string }) => void) => {
      const listener = (_event: IpcRendererEvent, data: { error: string }) => callback(data)
      ipcRenderer.on('update_error', listener)
      return () => ipcRenderer.removeListener('update_error', listener)
    },
    onDownloadProgress: (
      callback: (data: { percent: number; transferred: number; total: number }) => void
    ) => {
      const listener = (
        _event: IpcRendererEvent,
        data: { percent: number; transferred: number; total: number }
      ) => callback(data)
      ipcRenderer.on('update_download_progress', listener)
      return () => ipcRenderer.removeListener('update_download_progress', listener)
    },
    installUpdate: () => ipcRenderer.send('install-update')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
