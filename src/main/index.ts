import { app, shell, BrowserWindow, ipcMain, net, protocol, nativeImage } from 'electron'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { Database } from './database'
import { searchBooks, downloadCover } from './openlibrary'
import { getRecommendations } from './claude'

let db: Database

function createWindow(): void {
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    show: false,
    icon,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0f0f0f',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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

// Register covers:// protocol to serve local cover images
protocol.registerSchemesAsPrivileged([
  { scheme: 'covers', privileges: { standard: true, secure: true, bypassCSP: true, supportFetchAPI: true } }
])

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.bookworm')

  protocol.handle('covers', async (request) => {
    const url = new URL(request.url)
    const filename = url.pathname.replace(/^\/+/, '')
    const filePath = join(app.getPath('userData'), 'covers', filename)
    try {
      const data = await readFile(filePath)
      return new Response(data, { headers: { 'Content-Type': 'image/jpeg' } })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  db = new Database()
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function registerIpcHandlers(): void {
  ipcMain.handle('books:getAll', () => db.getAllBooks())
  ipcMain.handle('books:add', (_event, book) => db.addBook(book))
  ipcMain.handle('books:update', (_event, id, updates) => db.updateBook(id, updates))
  ipcMain.handle('books:delete', (_event, id) => db.deleteBook(id))
  ipcMain.handle('books:search', (_event, query: string) => searchBooks(query))
  ipcMain.handle('books:downloadCover', async (_event, coverId: number) => {
    const path = await downloadCover(coverId)
    return path ? coverId : null
  })

  ipcMain.handle('settings:get', () => db.getSettings())
  ipcMain.handle('settings:update', (_event, updates) => db.updateSettings(updates))
  ipcMain.handle('discover:getRecommendations', async () => {
    const settings = db.getSettings()
    if (!settings.claudeApiKey) {
      throw new Error('Please add your Claude API key in Settings first.')
    }
    const books = db.getAllBooks()
    return getRecommendations(books, settings.claudeApiKey)
  })
}
