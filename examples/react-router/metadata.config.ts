import { defineConfig, route } from "haribote";

export default defineConfig({
  defaults: {
    twitterCard: "summary_large_image",
  },
  routes: [
    route("/", { title: "Home | haribote", description: "Home page" }),
    route("/about", { title: "About | haribote", description: "About this site" }),
    route("/articles/:id", async ({ params }) => ({
      title: `Article ${params.id} | haribote`,
      description: `Article ${params.id} detail`,
    })),
  ],
});
