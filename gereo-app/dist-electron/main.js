"use strict";
const require$$0 = require("electron");
const require$$1 = require("path");
const require$$2 = require("fs");
const require$$3 = require("knex");
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var main$1 = {};
var hasRequiredMain;
function requireMain() {
  if (hasRequiredMain) return main$1;
  hasRequiredMain = 1;
  const { app, BrowserWindow, ipcMain } = require$$0;
  const path = require$$1;
  const fs = require$$2;
  const knex = require$$3;
  const dbPath = path.join(app.getPath("userData"), "gereo.db");
  const db = knex({
    client: "sqlite3",
    connection: { filename: dbPath },
    useNullAsDefault: true
  });
  async function initializeDatabase() {
    console.log("Chemin de la base de données :", dbPath);
    try {
      const tableExists = await db.schema.hasTable("products");
      if (!tableExists) {
        console.log("Les tables n'existent pas, création en cours...");
        const schemaPath = path.join(app.getAppPath(), "public", "schema.sql");
        const schema = fs.readFileSync(schemaPath).toString();
        await db.raw(schema);
        console.log("✅ Base de données initialisée avec succès !");
      } else {
        console.log("✅ La base de données existe déjà.");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation de la base de données:", error);
    }
  }
  function createWindow() {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs")
      }
    });
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl) {
      win.loadURL(devServerUrl);
      win.webContents.openDevTools();
    } else {
      win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
  }
  app.whenReady().then(async () => {
    await initializeDatabase();
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
  return main$1;
}
var mainExports = requireMain();
const main = /* @__PURE__ */ getDefaultExportFromCjs(mainExports);
module.exports = main;
