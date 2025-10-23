import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initDatabase, getKnex } from "../src/lib/db";
import bcrypt from "bcryptjs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("auth:login", async (_, { username, password }) => {
  const knex = getKnex(); // On récupère l'instance au moment de l'appel
  try {
    const user = await knex("users").where({ username }).first();
    if (!user) {
      return { success: false, message: "Nom d'utilisateur incorrect." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Mot de passe incorrect." };
    }

    return {
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Une erreur est survenue." };
  }
});

//STOCK MANAGEMENT

ipcMain.handle("products:get", async () => {
  const knex = getKnex();
  try {
    const products = await knex("products").select("*");
    return { success: true, products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, message: "Une erreur est survenue." };
  }
});

ipcMain.handle("product:add", async (_, productData) => {
  const knex = getKnex();
  try {
    const [insertedProduct] = await knex("products")
      .insert(productData)
      .returning("*");
    return { success: true, product: insertedProduct };
  } catch (error) {
    console.error("Error adding product:", error);
    return { success: false, message: "Une erreur est survenue." };
  }
});

ipcMain.handle("stock-entry:add", async (_, entryData) => {
  const knex = getKnex();
  try {
    //
    await knex("stock_movements").insert(entryData);
    await knex("products")
      .where("id", entryData.product_id)
      .increment("current_stock", entryData.quantity);
    return { success: true };
  } catch (error) {
    console.error("Error adding stock entry:", error);
    return { success: false, message: "Une erreur est survenue." };
  }
});

ipcMain.handle("stock-entries:get", async () => {
  const knex = getKnex();
  try {
    const entries = await knex("stock_movements")
      .join("products", "stock_movements.product_id", "=", "products.id")
      .select("stock_movements.*", "products.name as product_name")
      .orderBy("movement_date", "desc");
    return { success: true, entries };
  } catch (error) {
    console.error("Error fetching stock entries:", error);
    return { success: false, message: "Une erreur est survenue." };
  }
});

//GESTION DE VENTE
ipcMain.handle("settings:get", async () => {
  const knex = getKnex();
  try {
    const settingsArray = await knex("settings").select("*");
    // Convert array of {key, value} to a single object
    const settings = settingsArray.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    return { success: true, settings };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des paramètres.",
    };
  }
});

ipcMain.handle("sale:save", async (_, saleData) => {
  const knex = getKnex();
  const {
    customer_name,
    is_credit_sale,
    items,
    total_amount,
    discount_total,
    amount_paid,
  } = saleData;

  // Use a transaction to ensure all operations succeed or fail together
  const trx = await knex.transaction();
  try {
    let customerId = null;
    // Basic customer handling (find or create - can be improved later)
    if (customer_name) {
      let customer = await trx("customers")
        .where("name", customer_name)
        .first();
      if (!customer) {
        const [newCustomer] = await trx("customers")
          .insert({ name: customer_name })
          .returning("id");
        // In SQLite, returning('id') might return an object like { id: newId } or just the newId depending on config/driver
        customerId =
          typeof newCustomer === "object" ? newCustomer.id : newCustomer;
      } else {
        customerId = customer.id;
      }
    }

    const amount_due = total_amount - amount_paid;
    const status = amount_due <= 0 ? "PAID" : "UNPAID";

    // 1. Create Invoice
    const [invoice] = await trx("invoices")
      .insert({
        customer_id: customerId,
        invoice_date: new Date(),
        total_amount: total_amount,
        discount: discount_total, // Store total discount amount
        amount_paid: amount_paid,
        amount_due: amount_due,
        status: status,
      })
      .returning("id");

    // In SQLite, returning('id') might return an object like { id: newId } or just the newId
    const invoiceId = typeof invoice === "object" ? invoice.id : invoice;

    // 2. Create Invoice Items and Update Stock
    for (const item of items) {
      await trx("invoice_items").insert({
        invoice_id: invoiceId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price_after_discount, // Save the price actually charged
        total_price: item.total,
      });

      // Decrease stock
      await trx("products")
        .where("id", item.product_id)
        .decrement("current_stock", item.quantity);

      // Record stock movement for sale
      await trx("stock_movements").insert({
        product_id: item.product_id,
        movement_type: "SALE",
        quantity: -item.quantity, // Negative quantity for sale
        unit_price: item.unit_price_after_discount, // Price sold at
        movement_date: new Date(),
        notes: `Invoice ID: ${invoiceId}`,
      });
    }

    // 3. Update Customer Debt if it's a credit sale
    if (customerId && amount_due > 0) {
      await trx("customers")
        .where("id", customerId)
        .increment("total_debt", amount_due);
    }

    // TODO: Record Cash Movement (optional for now)

    await trx.commit(); // Commit transaction if all steps succeed
    return { success: true, invoiceId: invoiceId };
  } catch (error) {
    await trx.rollback(); // Rollback transaction on error
    console.error("Error saving sale:", error);
    // Check for specific stock errors if needed
    if (error.message.includes("CHECK constraint failed")) {
      // Example check for potential negative stock constraint
      return {
        success: false,
        message: "Erreur: Stock insuffisant pour un des produits.",
      };
    }
    return {
      success: false,
      message: "Erreur lors de l'enregistrement de la vente.",
    };
  }
});

app.whenReady().then(() => {
  initDatabase();
  createWindow();
});
