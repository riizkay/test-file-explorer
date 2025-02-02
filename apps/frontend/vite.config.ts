import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4000, // atur port yang diinginkan di sini
    host: true, // mengizinkan akses dari network
    strictPort: true, // akan error jika port sudah digunakan
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@utils": path.resolve(__dirname, "../../packages/utils"),
      "@shared": path.resolve(__dirname, "../../packages/shared"),
    },
  },
});
