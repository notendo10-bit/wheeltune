const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const userDataPath = app.getPath('userData')
const lastFolderFile = path.join(userDataPath, 'lastfolder.txt')

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 780,
    resizable: false,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  })
  win.loadFile('renderer/index.html')
}

ipcMain.handle('pick-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (result.canceled) return null
  const dir = result.filePaths[0]
  fs.writeFileSync(lastFolderFile, dir, 'utf8')
  return scanFolder(dir)
})

ipcMain.handle('load-last-folder', () => {
  try {
    if (!fs.existsSync(lastFolderFile)) return null
    const dir = fs.readFileSync(lastFolderFile, 'utf8').trim()
    if (!fs.existsSync(dir)) return null
    return scanFolder(dir)
  } catch(e) { return null }
})

function scanFolder(dir) {
  const files = fs.readdirSync(dir)
    .filter(f => /\.(mp3|flac|m4a|wav)$/i.test(f))
    .map(f => ({ name: f, path: path.join(dir, f) }))
  return { dir, files }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())