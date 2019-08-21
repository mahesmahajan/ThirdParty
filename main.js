const {app, BrowserWindow} = require('electron')
const log = require('electron-log');
log.transports.file.file = __dirname + '/thirdParty.log';
const electron = require('electron');
let consoleWindow, forWindow

function createWindow () {
  var displays = electron.screen.getAllDisplays();
  for (var i in displays) {
    if (displays[i].bounds.x != 0 || displays[i].bounds.y != 0) {
      forWindow = new BrowserWindow({ x: displays[i].bounds.x, y: displays[i].bounds.y, frame: false, webPreferences: { nodeIntegration: true, webSecurity: true } });
      forWindow.maximize();
      forWindow.loadURL('file://' + __dirname + '/for.html');
      forWindow.openDevTools();
    }
    if (displays[i].bounds.x == 0 && displays[i].bounds.y == 0) {
      consoleWindow = new BrowserWindow({ x: displays[i].bounds.x, y: displays[i].bounds.y, frame: false, webPreferences: { nodeIntegration: true } })
      consoleWindow.maximize();
      consoleWindow.loadURL('file://' + __dirname + '/index.html');
    }
  }

  consoleWindow.on('closed', function () { consoleWindow = null, forWindow = null })
  forWindow.on('closed', function () { forWindow = null, consoleWindow = null })
  log.info(' Launching app');
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

app.on('activate', function () {
  if (consoleWindow === null) {
    createWindow()
  }
})