"use strict";
const require$$0 = require("electron");
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var preload$1 = {};
var hasRequiredPreload;
function requirePreload() {
  if (hasRequiredPreload) return preload$1;
  hasRequiredPreload = 1;
  const { contextBridge, ipcRenderer } = require$$0;
  contextBridge.exposeInMainWorld("api", {
    // Exemple d'une fonction qu'on pourra appeler depuis React
    // comme ceci : await window.api.getAppName()
    getAppName: () => ipcRenderer.invoke("get-app-name")
    // C'est ici qu'on ajoutera nos fonctions :
    // getProducts: () => ipcRenderer.invoke('get-products'),
    // addSale: (saleData) => ipcRenderer.invoke('add-sale', saleData),
  });
  return preload$1;
}
var preloadExports = requirePreload();
const preload = /* @__PURE__ */ getDefaultExportFromCjs(preloadExports);
module.exports = preload;
