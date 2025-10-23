// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// On expose des fonctions sûres au monde du "Renderer" (React)
contextBridge.exposeInMainWorld('api', {
  // Exemple d'une fonction qu'on pourra appeler depuis React
  // comme ceci : await window.api.getAppName()
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // C'est ici qu'on ajoutera nos fonctions :
  // getProducts: () => ipcRenderer.invoke('get-products'),
  // addSale: (saleData) => ipcRenderer.invoke('add-sale', saleData),
});