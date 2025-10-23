import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
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
    }),
  ],
});
