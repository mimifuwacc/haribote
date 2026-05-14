import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { metaSSR } from "haribote";

export default defineConfig({
  plugins: [react(), metaSSR()],
  optimizeDeps: {
    exclude: ["haribote"],
  },
});
