// src/types/electron.d.ts
export interface IAuth {
    login: (credentials: {username, password}) => Promise<{success: boolean, message?: string, user?: any}>;
}

declare global {
  interface Window {
    auth: IAuth;
  }
}