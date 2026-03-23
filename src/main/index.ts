import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../build/icon.ico?asset'

// Import autoUpdater
import { autoUpdater } from 'electron-updater'

let mainWindow: BrowserWindow

autoUpdater.autoDownload = false

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    title: 'Pomodoro Timer v1.1.0',
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    // Delay update check to ensure window is fully ready
    setTimeout(() => {
      console.log('[Auto-Update] Checking for updates...')
      console.log('[Auto-Update] Current version:', app.getVersion())
      console.log('[Auto-Update] Feed URL:', autoUpdater.currentVersion)
      autoUpdater.checkForUpdates().catch((error: Error) => {
        console.error('[Auto-Update] Check for updates failed:', error.message)
      })
    }, 1000)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('[Auto-Update] Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  console.log('[Auto-Update] Update available:', info.version)
  mainWindow?.webContents.send('update_available', { version: info.version })

  if (!mainWindow) {
    console.warn('[Auto-Update] mainWindow not available, skipping dialog')
    return
  }

  dialog
    .showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update Available',
      message: `Version ${info.version} is available.`,
      detail: 'Do you want to download the update now?'
    })
    .then((result) => {
      console.log('[Auto-Update] User choice:', result.response === 0 ? 'Download' : 'Later')
      if (result.response === 0) {
        console.log('[Auto-Update] Starting download...')
        autoUpdater.downloadUpdate().catch((error: Error) => {
          console.error('[Auto-Update] Download failed:', error.message)
          mainWindow?.webContents.send('update_error', { error: error.message })
        })
      }
    })
    .catch((error: Error) => {
      console.error('[Auto-Update] Dialog error:', error.message)
    })
})

autoUpdater.on('update-not-available', () => {
  console.log('[Auto-Update] No updates available')
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('[Auto-Update] Update downloaded:', info.version)
  mainWindow?.webContents.send('update_downloaded', { version: info.version })

  void dialog
    .showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['Install and Restart', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded.`,
      detail: 'Install the update now and restart the app?'
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
})

autoUpdater.on('error', (error) => {
  console.error('[Auto-Update] Error:', error.message)
  mainWindow?.webContents.send('update_error', { error: error.message })
})

app.setName("Pomodoro Timer")
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron.pomodoro')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('install-update', () => {
    console.log('[Auto-Update] Installing update now...')
    autoUpdater.quitAndInstall()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
