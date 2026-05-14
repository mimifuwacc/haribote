import { defineConfig, route } from "haribote";

export default defineConfig({
  defaults: {
    twitterCard: "summary_large_image",
  },
  routes: [
    route("/", {
      title: "Home | My App",
      description: "Welcome to my app",
    }),
    route("/about", {
      title: "About | My App",
      description: "About this app",
    }),
  ],
});
