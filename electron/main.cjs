const { app, BrowserWindow } = require("electron");
const path = require("path");
function create() {
  const win = new BrowserWindow({ width: 1280, height: 800 });
  win.loadFile(path.join(__dirname, "../dist/index.html"));
}
app.whenReady().then(create);
