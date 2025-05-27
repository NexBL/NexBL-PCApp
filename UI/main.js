const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const botModule = require('../BotLogic/bot.js');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    frame: false,
    transparent: false,
    backgroundColor: '#121212',
    show: false,
    resizable: false,
    icon: path.join(__dirname, 'assets/icon.ico')
  });

  // Load the index.html file
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, recreate the window when the dock icon is clicked and no other windows are open
  if (mainWindow === null) {
    createWindow();
  }
});

// Custom window controls
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// Handle flood party requests from renderer
ipcMain.on('flood-party', (event, userId) => {
  console.log('Main process received flood-party request for user:', userId);
  try {
    botModule.floodPartyWithAllClients(userId);
    event.reply('flood-party-response', { success: true });
  } catch (error) {
    console.error('Error in flood-party:', error);
    event.reply('flood-party-response', { success: false, error: error.message });
  }
});
