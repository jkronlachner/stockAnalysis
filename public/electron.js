// public/electron.js

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const log = require('electron-log');
const net = electron.net;


const path = require("path");
const isDev = require("electron-is-dev");
const spawn = require("child_process").spawn;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {autoUpdater} = electron;
const url = require("url");
const {dialog, Menu} = require("electron")


let mainWindow;
let child;
let loading;

function createWindow() {


    // Define the applications dimension
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 920,
        movable: true,
        titleBarStyle: 'default',
        title: "Stock Analysis",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: true,
            images: true
        },
    });
    mainWindow.on("close", (e) => {
        var choice = electron.dialog.showMessageBoxSync(mainWindow, {
            type: 'warning',
            buttons: ['Nein', 'Ja'],
            title: 'Achtung',
            message: 'Bist du sicher das du das Fenster schließen möchtest? Wenn du das tust verlierst du jeglichen Fortschritt beim durchrechnen der Projekte.'
        })
        if (choice === 0) {
            e.preventDefault()
        } else {
            log.info("Quitting backend");
            const axios = require("axios")
            axios.post("http://localhost:4321/actuator/shutdown", {}, {
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then(r => log.info("Shutted backend down!"))
                .catch(error => log.error("error while trying to shutdown backend", error))
            log.info("Tried to quit backend via request!");
        }

    })

    mainWindow.setMenuBarVisibility(false);
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
        if (require("os").platform() === "win32") {
            log.info("Platform: WINDOWS");
            ses.loadExtension(
                "C:\\Users\\julia\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\lmhkpmbekcpmknklioeibfkpmmfibljd\\2.17.0_0"
            ).then(() => {
            })
            ses.loadExtension(
                "C:\\Users\\julia\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.10.1_0"
            ).then(() => {
            })
        } else {
            ses.loadExtension(
                "/Users/juliankronlachner/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0"
            ).then(() => {
            })
            ses.loadExtension(
                "/Users/juliankronlachner/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.10.0_0"
            ).then(() => {
            })
        }

        mainWindow.webContents.openDevTools();
    }
    // Create event to close window on close
    mainWindow.on("closed", () => (mainWindow = null));
}

async function showLoadingWindow() {
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
            enableRemoteModule: true,
            javascript: true,
            plugins: true,
            devTools: false,
            nodeIntegrationInSubFrames: true,
            nodeIntegrationInWorker: true,
        }
    })

    await loading.loadFile(path.resolve(__dirname, isDev ? '../output/loading.html' : '../../../output/loading.html'));
    await loading.show();
}

function startJavaBackend() {
    log.info("Backend is not running... Starting!");
    const jarPath = path.resolve(__dirname, isDev ? '../output' : '../../../output')
    child = spawn('cd ' + jarPath + '&& java', ['-jar', 'veskur-core-backend.jar', '--spring.profiles.active=prod'], {shell: true})
    child.noAsar = true;
    child.stdout.on('data', data => {
        log.info(data.toString());
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
            message: "Fehlercode: " + code + "pfad: " + jarPath,
        });
        loading.close();
    })
}

// On launch create app window
app.on("ready", async () => {
    //Show loading window while checking java and starting backend
    await showLoadingWindow()


    //Configure AutoUpdater with Update Server
    log.info("Configuring Update Server")
    try {
        const server = 'https://stock-analysis-update-server.herokuapp.com'
        const url = `${server}/update/${process.platform}/${app.getVersion()}`
        autoUpdater.setFeedURL({url: url})
        setInterval(() => {
            autoUpdater.checkForUpdates()
        }, 6000);
    } catch (e) {
        log.warn("Error within update Process: " + e)
    }
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        const dialogOpts = {
            type: 'info',
            buttons: ['Neustarten', 'Später'],
            title: 'StockAnalysis Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'Eine neue Version von StockAnalysis ist verfügbar! Möchtest du die Applikation jetzt neu starten?'
        }
        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    })

    autoUpdater.on("update-available", () => {
        console.log("Update is available")
    })
    autoUpdater.on("checking-for-update", () => {
        console.log("Checking update!")
    })
    //Auto Updater END

    log.info('App starting...');
    loading.webContents.openDevTools()
    loading.webContents.send("installer-update", "Warming up...");


    await checkInstalls();
    //New check installed in sh file



    //Starting backend
    log.info("Searching for jar in Path: " + app.getAppPath());

    log.info("Checking if backend is running!");
    const axios = require("axios")
    axios.get("http://localhost:4321/actuator/health").then(value => {
        if (value.data.status === "UP") {
            log.info("Backend is up! starting window");
            createWindow();
        } else {
            log.info("Backend is not up, starting...");
            startJavaBackend();
        }
    }).catch(e => {
        log.error("Error in request, prob not running. Starting...")
        startJavaBackend();
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

app.on("activate", () => {
    if (loading !== null) {
        loading.show();
    } else if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

async function checkInstalls() {
    try{
    const shell = require("shelljs");
    shell.config.execPath = shell.which('node').toString()

    if(!shell.which("java")){
        showError("Java is required to run StockAnalysis")
        shell.exit(1)
    }
    if(!shell.which("python")){
        showError("Pyhton is required to run StockAnalysis")
        shell.exit(1)
    }
    if(!shell.which("pip")){
        showError("Error while searching Python Packages with pip.")
        shell.exit(1)
    }
    shell.exec('pip install tensorflow keras numpy matplotlib')
    }catch (e) {
        log.error("Error while trying to check installs")
        log.error(e)
    }
}

function showError(error) {
    if (!error || error === "") {
        return
    }
    log.error("Error: " + error);
    loading.close();
    dialog.showMessageBox({
        title: "Fehler beim Starten der Applikation",
        message: error,
        detail: "Du kannst die Applikation starten, allerdings könnten dann Funktionen eingeschränkt sein."
    });
}
