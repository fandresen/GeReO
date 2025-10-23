import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        // Configuration pour le processus principal (main.cjs)
        entry: "electron/main.cjs",
        vite: {
          build: {
            rollupOptions: {
              external: [
                "knex",
                "sqlite3",
                "better-sqlite3",
                "pg",
                "mysql",
                "mysql2",
                "oracledb",
                "tedious",
                "pg-query-stream",
              ],
            },
          },
        },
      },
      {
        // Configuration pour le script de preload (essentiel)
        entry: "electron/preload.cjs",
        onstart(options) {
          options.reload();
        },
      },
    ]),
    renderer(),
  ],
});
