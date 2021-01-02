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
const { dialog } = require("electron")

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
        movable: true,
        titleBarStyle: 'hidden',
        title: "Stock Analysis",
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
        //Add Dev Extensions to Chromium
        const ses = mainWindow.webContents.session
        ses.loadExtension(
            "/Users/juliankronlachner/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0"
        )
        ses.loadExtension(
            "/Users/juliankronlachner/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.10.0_0"
        )
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
        pathname: path.join(__dirname, isDev ? "../public/loading.html" : "../build/loading.html"),
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
    autoUpdater.setFeedURL('https://stock-analysis-update-server.herokuapp.com/' + platform + '/' + version);
    autoUpdater.checkForUpdatesAndNotify();
    //Auto Updater END

    //Show loading window while checking java and starting backend
    showLoadingWindow()

    //Check java installed
    let javaSpawnChild = spawn('java', ['--version']);
    javaSpawnChild.stdout.on('data', data => {
        if (data.toString().includes("not recognized")) {
            dialog.showMessageBox({
                title: "Fehler beim Starten der Applikation",
                message: "Java command not found. Please install Java command to continue!",
                detail: "Bitte installiere den Java Command auf deinem System um Stock Analysis zu verwenden"
            });
            return;
        }
    })
    //END OF CHECK

    //Starting backend
    log.info("Searching for jar in Path: " + app.getAppPath());

    const jarPath = app.getAppPath() + (isDev ? '/public/veskur-core-backend.jar' : '/build/veskur-core-backend.jar')
    child = spawn('java', ['-jar', jarPath, ''])
    child.stdout.on('data', data => {
        log.info([data.toString()]);
        if (data.toString().includes("Started")) {
            createWindow();
        }
    })

    child.stderr.on('data', function (data) {
        log.error('stderr: ' + data);
    });

    child.on('close', function (code) {
        log.error('child process exited with code ' + code);
        dialog.showMessageBox({
            title: "Fehler beim Starten der Applikation",
            message: "Fehlercode: " + code,
        });
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

app.on("before-quit", (e) => {
    var choice = electron.dialog.showMessageBox(this, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Achtung',
        message: 'Bist du sicher das du das Fenster schließen möchtest? Wenn du das tust verlierst du jeglichen Fortschritt beim durchrechnen der Projekte.'
    })
    if(choice===1){
        e.preventDefault()
    }else{
        console.log("Quitting backend!")
        const kill = require('tree-kill');
        kill(child.pid);
    }

})



app.on("activate", () => {
    if (mainWindow !== null) {
        createWindow();
    }
});
