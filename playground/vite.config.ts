import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const playgroundRoot = fileURLToPath(new URL(".", import.meta.url));
const sourceEntry = fileURLToPath(new URL("../src/index.ts", import.meta.url));
const sourceStyles = fileURLToPath(new URL("../src/styles.css", import.meta.url));

export default defineConfig({
  root: playgroundRoot,
  cacheDir: fileURLToPath(new URL("../node_modules/.vite", import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@standhigher/react-email-editor/styles.css",
        replacement: sourceStyles,
      },
      {
        // 完整匹配包名，避免 styles.css 子路径被改写到 index.ts。
        find: /^@standhigher\/react-email-editor$/,
        replacement: sourceEntry,
      },
    ],
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
  },
});
