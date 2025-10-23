"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("auth", {
  login: (credentials) => electron.ipcRenderer.invoke("auth:login", credentials)
});
electron.contextBridge.exposeInMainWorld("stock", {
  getProducts: () => electron.ipcRenderer.invoke("products:get"),
  addProduct: (productData) => electron.ipcRenderer.invoke("product:add", productData),
  addStockEntry: (entryData) => electron.ipcRenderer.invoke("stock-entry:add", entryData),
  getStockEntries: () => electron.ipcRenderer.invoke("stock-entries:get")
});
electron.contextBridge.exposeInMainWorld("sales", {
  saveSale: (saleData) => electron.ipcRenderer.invoke("sale:save", saleData)
});
electron.contextBridge.exposeInMainWorld("settings", {
  getSettings: () => electron.ipcRenderer.invoke("settings:get")
});
