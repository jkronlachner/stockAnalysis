// public/electron.js
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;
let child;

function createWindow() {
  // Define the applications dimension
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 920,
    titleBarStyle: 'hidden',
  });

  // Determine what to render based on environment
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Show chrome developer tools when in dev environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  // Create event to close window on close
  mainWindow.on("closed", () => (mainWindow = null));
}

// On launch create app window
app.on("ready", () => {
  /* SERVER OUTPUT STYLE */
  let baseStyles = [
    "color: #fff",
    "background-color: #444",
    "padding: 2px 4px",
    "border-radius: 2px"
  ].join(';');

  const jarPath = app.getAppPath() + '/utils/veskur-core-backend-0.0.1-1.jar'
  const spawn = require("child_process").spawn;
  child = spawn('java', ['-jar', jarPath, ''])
  child.stdout.on('data', data => {
    console.log("%c" + data, baseStyles);
    if(data.toString().includes( "Started VeskurCoreBackendApplication")){
      createWindow();
    }
  })
  child.stderr.on('data', function (data) {
    console.log('%cstderr: ' + data, baseStyles);
  });

  child.on('close', function (code) {
    console.log('%cchild process exited with code ' + code, baseStyles);
    throw Error("Fehler beim öffnen der Applikation.");
  })
});
app.on("window-all-closed", () => {
    // Based on which operating system you are using
  if (process.platform !== "linux") {
      // If os not linux, close the app
      // you can add darwin(mac os), win64 and so many more
    app.quit();
  }
});

app.on("before-quit", () => {
  console.log("Quitting backend!")
  const kill = require('tree-kill');
  kill(child.pid);
})

app.on("activate", () => {
  if (mainWindow !== null) {
    createWindow();
  }
});
