import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@screenpipe-ui/core": path.resolve(__dirname, "../core/src/index.ts"),
      "@screenpipe-ui/react": path.resolve(__dirname, "../react/src/index.ts"),
    },
  },
});
