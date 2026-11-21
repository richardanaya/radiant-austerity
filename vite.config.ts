import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL("./demo", import.meta.url));

export default defineConfig({
  root,
  base: process.env.PAGES_BASE ?? "/",
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: {
    outDir: "../dist/demo",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./demo/index.html", import.meta.url)),
        gallery: fileURLToPath(new URL("./demo/gallery.html", import.meta.url)),
        app: fileURLToPath(new URL("./demo/app.html", import.meta.url)),
      },
    },
  },
});
