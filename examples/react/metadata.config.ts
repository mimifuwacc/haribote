import { defineConfig, route } from "haribote";

export default defineConfig({
  defaults: {
    twitterCard: "summary_large_image",
  },
  routes: [
    route("/", {
      title: "Home | haribote",
      description: "A Vite Plugin demo that SSRs only meta tags",
      ogImage: "https://example.com/og-home.png",
    }),
    route("/articles/:id", async ({ params }) => {
      return {
        title: `Article ${params.id} | haribote`,
        description: `Article ${params.id} detail page`,
        ogImage: `https://example.com/og-article-${params.id}.png`,
      };
    }),
    route("/about", {
      title: "About | haribote",
      description: "About this site",
    }),
  ],
});
