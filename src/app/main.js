const { app, BrowserWindow } = require('electron');
const path = require('path');
// only for dev require('electron-reloader')(module);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
};

app.whenReady().then(() => {
  createWindow();
});
