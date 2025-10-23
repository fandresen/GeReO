// src/types/electron.d.ts
export interface IAuth {
    login: (credentials: {username, password}) => Promise<{success: boolean, message?: string, user?: any}>;
}

export interface IStock {
    getProducts: () => Promise<{success: boolean, products?: any[]}>;
    addProduct: (productData: any) => Promise<{success: boolean, product?: any}>;
    addStockEntry: (entryData: any) => Promise<{success: boolean}>;
    getStockEntries: () => Promise<{success: boolean, entries?: any[]}>;
}

export interface ISales {
    saveSale: (saleData: any) => Promise<{ success: boolean; invoiceId?: number; message?: string }>;
    // We also need access to products for the dropdown in sales
    // We can reuse IStock or add relevant methods here if preferred
}

export interface ISettings {
     getSettings: () => Promise<{ success: boolean; settings?: Record<string, string>; message?: string }>;
}

declare global {
  interface Window {
    auth: IAuth;
    stock: IStock;
    sales:ISales;
    settings: ISettings;
  }
}