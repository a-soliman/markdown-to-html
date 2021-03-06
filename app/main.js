const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

require('./crash-reporter');

const createApplicationMenu = require('./application-menu');
app.setName('Fire Sale');
const windows = new Set();
const openFiles = new Map();

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
  });

  newWindow.on('focus', createApplicationMenu);

  newWindow.on('close', evt => {
    // TODO:: isDocumentEdited() is a mac only method, find an alt for win and linux.
    if (newWindow.isDocumentEdited()) {
      evt.preventDefault();

      const result = dialog.showMessageBox(newWindow, {
        type: 'warning',
        title: 'Quit with Unsaved Changes',
        message: 'Your changes will be lost if you do not save.',
        buttons: ['Quit Anyway', 'Cancel'],
        defaultId: 0,
        cancelId: 1
      });

      if (result === 0) newWindow.destroy();
    }
  });

  newWindow.on('closed', () => {
    windows.delete(newWindow);
    createApplicationMenu();
    stopWatchingFile(newWindow);
    newWindow = null;
  });

  windows.add(newWindow);
  return newWindow;
});

app.on('ready', () => {
  createApplicationMenu();
  createWindow();
});

app.on('activate', (evt, hasVisibleWinow) => {
  if (!hasVisibleWinow) createWindow();
});

app.on('will-finish-lanching', () => {
  app.on('open-file', (evt, file) => {
    const win = createWindow();
    win.once('ready-to-show', () => {
      openFile(win, file);
    });
  });
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
  app.addRecentDocument(file);
  targetWindow.setRepresentedFilename(file);
  targetWindow.webContents.send('file-opened', file, content);
  createApplicationMenu();
});

const startWatchingFile = (targetWindow, file) => {
  stopWatchingFile(targetWindow);

  const watcher = fs.watchFile(file, evt => {
    if (evt === 'change') {
      const content = fs.readFileSync(file).toString();
      targetWindow.webContents.send('file-changed', file, content);
    }
  });

  openFiles.set(targetWindow, watcher);
};

const stopWatchingFile = targetWindow => {
  if (openFiles.has(targetWindow)) {
    openFiles.get(targetWindow).stop();
    openFiles.delete(targetWindow);
  }
};

const saveHtml = (exports.saveHtml = (targetWindow, content) => {
  let file = dialog.showSaveDialog(targetWindow, {
    title: 'Save HTML',
    defaultPath: app.getPath('documents'),
    filters: [{ name: 'HTML Files', extensions: ['html', 'htm'] }]
  });

  if (!file) return;
  if (
    !path.extname(file) ||
    path.extname !== '.html' ||
    path.extname !== '.htm'
  )
    file = `${file}.html`;
  fs.writeFileSync(file, content);
});

const saveMarkdown = (exports.saveMarkdown = (targetWindow, file, content) => {
  if (!file) {
    file = dialog.showSaveDialog(targetWindow, {
      title: 'Save Markdown',
      defaultPath: app.getPath('documents'),
      filters: [{ name: 'Markdown Files', extensions: ['md', 'txt'] }]
    });
  }
  if (!file) return;
  if (!path.extname(file) || path.extname !== '.txt' || path.extname !== '.md')
    file = `${file}.txt`;

  fs.writeFileSync(file, content);
});
