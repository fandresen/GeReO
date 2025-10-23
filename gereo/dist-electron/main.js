import { app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Knex from "knex";
const dbPath = path.join(app.getPath("userData"), "gereo.db");
const knex = Knex({
  client: "better-sqlite3",
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true
});
async function initDatabase() {
  try {
    await knex.raw("SELECT 1");
    await knex.schema.createTableIfNotExists("products", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable().unique();
      table.string("reference_code");
      table.decimal("purchase_price").defaultTo(0);
      table.decimal("wholesale_price").defaultTo(0);
      table.decimal("selling_price").defaultTo(0);
      table.integer("current_stock").defaultTo(0);
      table.integer("min_stock_alert").defaultTo(0);
    });
    await knex.schema.createTableIfNotExists("stock_movements", (table) => {
      table.increments("id").primary();
      table.integer("product_id").unsigned().notNullable().references("id").inTable("products").onDelete("CASCADE");
      table.string("movement_type").notNullable();
      table.integer("quantity").notNullable();
      table.decimal("unit_price");
      table.datetime("movement_date").defaultTo(knex.fn.now());
      table.text("notes");
    });
    await knex.schema.createTableIfNotExists("customers", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("phone");
      table.string("address");
      table.decimal("total_debt").defaultTo(0);
    });
    await knex.schema.createTableIfNotExists("invoices", (table) => {
      table.increments("id").primary();
      table.integer("customer_id").unsigned().references("id").inTable("customers").onDelete("SET NULL");
      table.datetime("invoice_date").defaultTo(knex.fn.now());
      table.decimal("total_amount").defaultTo(0);
      table.decimal("discount").defaultTo(0);
      table.decimal("amount_paid").defaultTo(0);
      table.decimal("amount_due").defaultTo(0);
      table.string("status").defaultTo("PAID");
    });
    await knex.schema.createTableIfNotExists("invoice_items", (table) => {
      table.increments("id").primary();
      table.integer("invoice_id").unsigned().notNullable().references("id").inTable("invoices").onDelete("CASCADE");
      table.integer("product_id").unsigned().notNullable().references("id").inTable("products").onDelete("RESTRICT");
      table.integer("quantity").notNullable();
      table.decimal("unit_price").notNullable();
      table.decimal("total_price").notNullable();
    });
    await knex.schema.createTableIfNotExists("expenses", (table) => {
      table.increments("id").primary();
      table.datetime("expense_date").defaultTo(knex.fn.now());
      table.text("description").notNullable();
      table.string("category");
      table.decimal("amount").notNullable();
    });
    await knex.schema.createTableIfNotExists("cash_movements", (table) => {
      table.increments("id").primary();
      table.datetime("movement_date").defaultTo(knex.fn.now());
      table.string("movement_type").notNullable();
      table.decimal("amount").notNullable();
      table.integer("reference_id");
      table.decimal("current_balance").notNullable();
      table.text("notes");
    });
    await knex.schema.createTableIfNotExists("settings", (table) => {
      table.string("key").primary();
      table.text("value");
    });
    const settings = await knex("settings");
    if (settings.length === 0) {
      await knex("settings").insert([
        { key: "company_name", value: "fandresenaCompany" },
        { key: "company_address", value: "Antananarivo Ambohijanaka" },
        { key: "company_phone", value: "0347818742" },
        { key: "company_nif", value: "52542455" },
        { key: "company_stat", value: "453148" },
        { key: "company_logo_path", value: "" },
        { key: "default_printer_type", value: "A4" }
      ]);
    }
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  initDatabase();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
