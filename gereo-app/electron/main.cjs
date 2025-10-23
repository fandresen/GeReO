// electron/main.cjs
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const knex = require('knex');

const dbPath = path.join(app.getPath('userData'), 'gereo.db');
const db = knex({
  client: 'sqlite3',
  connection: { filename: dbPath },
  useNullAsDefault: true,
});

async function initializeDatabase() {
  console.log('Chemin de la base de données :', dbPath);
  try {
    const tableExists = await db.schema.hasTable('products');
    if (!tableExists) {
      console.log("Les tables n'existent pas, création en cours...");
      const schemaPath = path.join(app.getAppPath(), 'public', 'schema.sql');
      const schema = fs.readFileSync(schemaPath).toString();
      await db.raw(schema);
      console.log('✅ Base de données initialisée avec succès !');
    } else {
      console.log('✅ La base de données existe déjà.');
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
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // La ligne la plus importante : VITE_DEV_SERVER_URL est fournie par le plugin
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools(); // Ouvre les outils de dev automatiquement
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  await initializeDatabase();
  createWindow(); // Appel pour créer la fenêtre

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});