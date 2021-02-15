let $ = require('jquery')
const electron = window.require("electron");
let version = electron.remote.app.getVersion();
$("#version").text(version);
