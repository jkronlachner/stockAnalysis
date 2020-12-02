// public/electron.js
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const log = require('electron-log');


const path = require("path");
const isDev = require("electron-is-dev");
const spawn = require("child_process").spawn;
const {autoUpdater} = require("electron-updater");
const url = require("url");

let mainWindow;
let child;
let loading;

//Auto updater Logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

function createWindow() {
  // Define the applications dimension
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 920,
    titleBarStyle: 'hidden',
    title: "Stock Analysis",
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true

    }
  });


  // Determine what to render based on environment
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  ).then(() => {
    loading.close();
    mainWindow.show();
  })

  // Show chrome developer tools when in dev environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  // Create event to close window on close
  mainWindow.on("closed", () => (mainWindow = null));
}

function showLoadingWindow() {
  loading = new BrowserWindow({
    show: true,
    width: 350,
    height: 400,
    frame: false,
    backgroundColor: "#2b2b2b",
    title: "Loading StockAnalysis...",
    closable: true,
    hasShadow: true,
    center: true,
    movable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true

    }
  })
  loading.loadURL(url.format({
    pathname: path.join(__dirname, "../public/loading.html"),
    protocol: "file:",
    slashes: true
  }));
  loading.show();
}

// On launch create app window
app.on("ready", () => {
  //Configure AutoUpdater with Update Server
  const os = require("os");
  const platform = os.platform() + "_" + os.arch();
  const version = app.getVersion();
  autoUpdater.setFeedURL('https://stock-analysis-update-server.herokuapp.com/'+platform + '/' + version);
  autoUpdater.checkForUpdatesAndNotify();
  //Auto Updater END

  //Show loading window while checking java and starting backend
  showLoadingWindow()

  //Check java installed
  let javaSpawnChild = spawn('java' , ['--version']);
  javaSpawnChild.stdout.on('data', data => {
    if(data.toString().includes("not recognized")){
      alert("Java command not found. Please install Java command to continue!");
    }
  })
  //END OF CHECK

  //Starting backend
  const jarPath = app.getAppPath() + '/utils/veskur-core-backend-0.0.1-1.jar'
  child = spawn('java', ['-jar', jarPath, ''])
  child.stdout.on('data', data => {
    log.info(["[backend_output] : ", data.toString()]);
    if(data.toString().includes( "Started")){
      createWindow();
    }
  })

  child.stderr.on('data', function (data) {
    log.error('stderr: ' + data);
  });

  child.on('close', function (code) {
    log.error('child process exited with code ' + code);
    throw Error("Fehler beim öffnen der Applikation.");
  })
  //END OF BACKEND CHECK
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
