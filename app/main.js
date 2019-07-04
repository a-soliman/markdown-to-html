const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const windows = new Set();

let createWindow = (exports.createWindow = () => {
  let x, y;
  const currentWindow = BrowserWindow.getFocusedWindow();

  if (currentWindow) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition();
    x = currentWindowX + 20;
    y = currentWindowY + 20;
  }

  let newWindow = new BrowserWindow({
    x,
    y,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  newWindow.loadFile(path.join(__dirname, 'client/index.html'));

  newWindow.once('ready-to-show', () => {
    newWindow.show();
    newWindow.webContents.openDevTools();
  });

  newWindow.on('closed', () => {
    windows.delete(newWindow);
    newWindow = null;
  });

  windows.add(newWindow);
  return newWindow;
});

app.on('ready', () => {
  createWindow();
});

app.on('activate', (evt, hasVisibleWinow) => {
  if (!hasVisibleWinow) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    return false;
  }
  app.quit();
});

// eslint-disable-next-line no-unused-vars
const getFileFromUser = (exports.getFileFromUser = targetWindow => {
  const files = dialog.showOpenDialog(targetWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });

  if (files) {
    openFile(targetWindow, files[0]);
  }
});

const openFile = (exports.openFile = (targetWindow, file) => {
  const content = fs.readFileSync(file).toString();
  targetWindow.webContents.send('file-opened', file, content);
});
