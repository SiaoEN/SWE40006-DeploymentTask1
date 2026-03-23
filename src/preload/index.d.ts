import { ElectronAPI } from '@electron-toolkit/preload'

interface UpdaterAPI {
  onUpdateAvailable: (callback: (data: { version: string }) => void) => () => void
  onUpdateDownloaded: (callback: (data: { version: string }) => void) => () => void
  onUpdateError: (callback: (data: { error: string }) => void) => () => void
  onDownloadProgress: (
    callback: (data: { percent: number; transferred: number; total: number }) => void
  ) => () => void
  installUpdate: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      updater: UpdaterAPI
    }
  }
}
