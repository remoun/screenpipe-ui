import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.SCREENPIPE_BASE_URL": JSON.stringify(
      process.env.SCREENPIPE_BASE_URL ?? ""
    ),
  },
  resolve: {
    alias: {
      "@screenpipe-ui/core": path.resolve(__dirname, "../core/src/index.ts"),
      "@screenpipe-ui/react": path.resolve(__dirname, "../react/src/index.ts"),
    },
  },
});
