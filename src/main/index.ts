import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../build/icon.ico?asset'

let mainWindow: BrowserWindow

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    title: 'Pomodoro Timer',
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

    if (!is.dev) {
      setTimeout(() => {
        void autoUpdater.checkForUpdates().catch((error: Error) => {
          console.error('[Auto-Update] Check for updates failed:', error.message)
          mainWindow?.webContents.send('update_error', { error: error.message })
        })
      }, 1000)
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

autoUpdater.on('checking-for-update', () => {
  console.log('[Auto-Update] Checking for updates...')
})

autoUpdater.on('update-available', (info) => {
  console.log('[Auto-Update] Update available:', info.version)
  mainWindow?.webContents.send('update_available', { version: info.version })
})

autoUpdater.on('update-not-available', () => {
  console.log('[Auto-Update] No updates available')
})

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('update_download_progress', {
    percent: progress.percent,
    transferred: progress.transferred,
    total: progress.total
  })
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('[Auto-Update] Update downloaded:', info.version)
  mainWindow?.webContents.send('update_downloaded', { version: info.version })

  if (!mainWindow) {
    return
  }

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.setName("Pomodoro Timer")
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron.pomodoro')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
