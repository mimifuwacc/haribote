import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { metaSSR } from "haribote";

export default defineConfig({
  plugins: [vue(), metaSSR()],
  optimizeDeps: {
    exclude: ["haribote"],
  },
});
