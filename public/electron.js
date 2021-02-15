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
const {autoUpdater} = require("electron-updater");
const url = require("url");
const {dialog, Menu} = require("electron")


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
        titleBarStyle: 'default',
        title: "Stock Analysis",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: true,
        },
    });
    mainWindow.setMenuBarVisibility(false);
    Menu.setApplicationMenu(false);

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
        pathname: path.resolve(__dirname, isDev ? '../output/loading.html' : '../../../output/loading.html'),
        protocol: "file:",
        slashes: true
    }));
    loading.show();
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
    //Configure AutoUpdater with Update Server
    const os = require("os");
    const platform = os.platform() + "_" + os.arch();
    const version = app.getVersion();
    autoUpdater.setFeedURL('https://stock-analysis-update-server.herokuapp.com/' + platform + '/' + version);
    autoUpdater.checkForUpdatesAndNotify();
    //Auto Updater END

    //Show loading window while checking java and starting backend
    showLoadingWindow()

    await checkInstalls();
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
        log.error("Error in request", e)
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

app.on("before-quit", async (e) => {
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
        axios.post("https://localhost:4321/actuator/shutdown").then(r => log.info("Shutted backend down!"))
        log.info("Tried to quit backend via request!");
    }

})


app.on("activate", () => {
    if (mainWindow !== null) {
        createWindow();
    }
});

async function checkInstalls() {
    //Check java, python and libraries are installed
    log.info("Checking java...")
    const javaExec = await exec('java --version');
    if (javaExec.stdout.toString().includes("not recognized")) {
        await dialog.showMessageBox({
            title: "Fehler beim Starten der Applikation",
            message: "Java command not found. Please install Java command to continue!",
            detail: "Bitte installiere den Java Command auf deinem System um Stock Analysis zu verwenden"
        });
        return;
    }
    showError(javaExec.stderr)
    log.info("Checking python...")
    const pythonExec = await exec('python3 --version');
    if (!pythonExec.stdout.toString().includes("Python 3")) {
        await dialog.showMessageBox({
            title: "Fehler beim Starten der Applikation",
            message: "Python3 command not found. Please install Python3 to continue!",
            detail: "Bitte installiere den Java Command auf deinem System um Stock Analysis zu verwenden"
        });
        return;
    }
    showError(pythonExec.stderr)

    log.info("Getting pip list");
    const pipListExec = await exec('pip3 list')
    log.info(pipListExec.stdout);

    if(!pipListExec.stdout.includes("Keras")){
        log.info("keras not installed! installing...")
        const {stdout, stderr} = await exec("pip3 install keras")
        log.silly(stdout, stderr)
        log.info("installed keras!")
    }
    if(!pipListExec.stdout.includes("tensorflow")){
        log.info("tensor not installed! installing...")
        const {stdout, stderr} = await exec("pip3 install tensorflow")
        log.silly(stdout, stderr)
        log.info("installed tensor!")
    }
    if(!pipListExec.stdout.includes("numpy")){
        log.info("numpy not installed! installing...")
        const {stdout, stderr} = await exec("pip3 install numpy")
        log.silly("silly!", stdout, stderr);
        log.info("installed numpy!")
    }

    showError(pipListExec.stderr)
    log.info("Everything installed!")
    //END OF CHECK
}

function showError(error){
    if(!error || error === ""){return}
    log.error("Error: " + error);
    dialog.showMessageBox({
        title: "Fehler beim Starten der Applikation",
        message: error,
        detail: "Du kannst die Applikation starten, allerdings könnten dann Funktionen eingeschränkt sein."
    });
}
