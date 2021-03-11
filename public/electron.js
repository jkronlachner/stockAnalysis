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
        //loading.close();
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
    console.log(loading.webContents);
    loading.webContents.openDevTools()
    loading.webContents.send("installer-update", "Warming up...");


    //await checkInstalls();
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
    //Check java, python and libraries are installed

    loading.webContents.send("installer-update", "Checking java...")

    log.info("Checking java...")
    const user = await exec('whoami');
    log.info("User: " + user.stdout)
    const javaExec = await exec('java -version');
    if (javaExec.stdout.toString().includes("not recognized")) {
        await dialog.showMessageBox({
            title: "Fehler beim Starten der Applikation",
            message: "Java command not found. Please install Java command to continue!",
            detail: "Bitte installiere den Java Command auf deinem System um Stock Analysis zu verwenden"
        });
        return;
    }
    if (!javaExec.stderr.toString().includes("version")) {
        showError(javaExec.stderr)
    }
    loading.webContents.send("installer-update", "Checking python...")
    log.info("Checking python...")
    const pythonExec = await exec('python --version').catch(() => {
        //loading.close();
        dialog.showMessageBox({
            title: "Fehler beim Starten der Applikation",
            message: "Python ist auf diesem Computer nicht installiert. Bitte installiere Pyhton um StockAnalysis starten zu können. "
        }).then(() => loading.close());
    });
    if (pythonExec.stdout.toString().includes("Python was not found")) {
        await dialog.showMessageBox({
            title: "Fehler beim Starten der Applikation",
            message: "Python3 command not found. Please install Python3 to continue!",
            detail: "Bitte installiere den Java Command auf deinem System um Stock Analysis zu verwenden"
        });
        loading.close();
        return;
    }
    if (!pythonExec.stderr.includes("Python")) {
        showError(pythonExec.stderr)
    }
    loading.webContents.send("installer-update", "Checking pip packages...")

    log.info("Getting pip list");
    const pipListExec = await exec('pip list')
    log.info(pipListExec.stdout);
    log.error(pipListExec.stderr);
    showError(pipListExec.stderr);

    if (!pipListExec.stdout.includes("Keras")) {
        loading.webContents.send("installer-update", "keras not installed! installing...")
        log.info("keras not installed! installing...")
        const {stdout, stderr} = await exec("pip install keras").catch((e) =>
            dialog.showMessageBox({
                title: "Fehler beim installieren von keras!",
                message: "Falls es weiterhin fehlschlägt, installiere bitte die folgenden Python Libraries selbst: \n keras, tensorflow, matplotlib und numpy",
                details: e
            })
        )
        log.silly(stdout, stderr)
        log.info("installed keras!")
        loading.webContents.send("installer-update", "keras installed!")
    } else {
        loading.webContents.send("installer-update", "keras installed!")
        log.info("Keras installed!")
    }
    if (!pipListExec.stdout.includes("tensorflow")) {
        loading.webContents.send("installer-update", "tensor not installed! installing...")
        log.info("tensor not installed! installing...")
        const {stdout, stderr} = await exec("pip install tensorflow").catch((e) => {
                log.error(e)
                dialog.showMessageBox({
                    title: "Fehler beim installieren von tensorflow!",
                    message: "Falls es weiterhin fehlschlägt, installiere bitte die folgenden Python Libraries selbst: \n keras, tensorflow, matplotlib und numpy",
                    details: e
                })
            }
        )
        log.silly(stdout, stderr)
        log.info("installed tensor!")
        loading.webContents.send("installer-update", "tensor installed!")
    } else {
        loading.webContents.send("installer-update", "tensor installed!")
        log.info("tensorflow installed!")
    }
    if (!pipListExec.stdout.includes("numpy")) {
        loading.webContents.send("installer-update", "numpy not installed! installing...")

        log.info("numpy not installed! installing...")
        const {stdout, stderr} = await exec("pip install numpy").catch((e) =>
            dialog.showMessageBox({
                title: "Fehler beim installieren von numpy!",
                message: "Falls es weiterhin fehlschlägt, installiere bitte die folgenden Python Libraries selbst: \n keras, tensorflow, matplotlib und numpy",
                details: e
            })
        )
        log.silly("silly!", stdout, stderr);
        loading.webContents.send("installer-update", "numpy installed!")
        log.info("installed numpy!")
    } else {
        loading.webContents.send("installer-update", "numpy installed!")
        log.info("numpy installed!")
    }
    if (!pipListExec.stdout.includes("matplotlib")) {
        loading.webContents.send("installer-update", "matplotlib not installed! installing...")
        log.info("matplot not installed! installing...")
        const {stdout, stderr} = await exec("pip install matplotlib").catch((e) =>
            dialog.showMessageBox({
                title: "Fehler beim installieren von matplotlib!",
                message: "Falls es weiterhin fehlschlägt, installiere bitte die folgenden Python Libraries selbst: \n keras, tensorflow, matplotlib und numpy",
                details: e
            })
        )
        log.silly("silly!", stdout, stderr);
        loading.webContents.send("installer-update", "matplotlib installed!")
        log.info("installed matplotlib!")
    } else {
        loading.webContents.send("installer-update", "matplotlib installed!")
        log.info("matplotlib installed!")
    }

    log.info("Everything installed!")
    loading.webContents.send("installer-update", "Check complete! Starting...")
    //END OF CHECK
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
