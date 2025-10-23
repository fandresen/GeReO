import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('auth', {
  login: (credentials: { username:string, password:string }) => ipcRenderer.invoke('auth:login', credentials),
});

contextBridge.exposeInMainWorld('stock', {
  getProducts: () => ipcRenderer.invoke('products:get'),
  addProduct: (productData) => ipcRenderer.invoke('product:add', productData),
  addStockEntry: (entryData) => ipcRenderer.invoke('stock-entry:add', entryData),
  getStockEntries: () => ipcRenderer.invoke('stock-entries:get'),
});

contextBridge.exposeInMainWorld('sales', {
  saveSale: (saleData) => ipcRenderer.invoke('sale:save', saleData),
});

contextBridge.exposeInMainWorld('settings', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
});
