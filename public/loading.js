let $ = require('jquery')
const electron = require("electron");
let version = electron.remote.app.getVersion();
$("version").text(version);
