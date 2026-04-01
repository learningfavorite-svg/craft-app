const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 820,
    minWidth: 380,
    minHeight: 700,
    maxWidth: 520,
    backgroundColor: '#0A1628',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Allow browser APIs (localStorage, MediaRecorder for voice input)
      webSecurity: true,
    },
    titleBarStyle: 'default',
    title: 'HMG Healthcare',
    // Center on screen
    center: true,
    show: false, // show only after ready-to-show to avoid flash
  });

  // Show window only when fully loaded — prevents blank-then-content flash
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  if (isDev) {
    // Dev: load from Next.js dev server
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Production: load from static export (next build → out/index.html)
    const indexPath = path.join(__dirname, '..', 'out', 'index.html');
    win.loadFile(indexPath);
  }

  // Retry on load failure (dev server cold start)
  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    if (isDev) {
      console.log('Load failed, retrying in 1s…', errorCode, errorDescription);
      setTimeout(() => win.loadURL('http://localhost:3000'), 1000);
    } else {
      console.error('Failed to load app:', errorCode, errorDescription);
    }
  });

  // Open external links in the system browser, not inside Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-platform', () => process.platform);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
