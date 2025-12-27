import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import terser from '@rollup/plugin-terser'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
      mangle: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
