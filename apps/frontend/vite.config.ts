import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
const CDN_URL = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/web`;
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === "production" ? CDN_URL : "/",
  build: {
    outDir: "dist", // Folder hasil build
    assetsDir: "assets", // Folder untuk menyimpan JS, CSS, dan gambar
    sourcemap: false, // Hilangkan sourcemap untuk memperkecil ukuran build
  },
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
