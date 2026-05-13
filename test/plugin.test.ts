import { describe, it, expect, afterEach } from "vitest";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";
import { metaSSR } from "../src/plugin";

describe("metaSSR plugin", () => {
  let server: ViteDevServer;

  afterEach(async () => {
    await server?.close();
  });

  it("injects meta tags for a static route", async () => {
    server = await createServer({
      root: "./test/fixtures/basic",
      plugins: [
        metaSSR({
          routes: [{ pattern: "/", meta: { title: "Home", description: "Welcome" } }],
        }),
      ],
      server: { middlewareMode: true },
    });

    const html = await server.transformIndexHtml("/", "<html><head></head><body></body></html>");
    expect(html).toContain("<title>Home</title>");
    expect(html).toContain('name="description" content="Welcome"');
  });

  it("passes dynamic params to the resolver", async () => {
    server = await createServer({
      root: "./test/fixtures/basic",
      plugins: [
        metaSSR({
          routes: [
            {
              pattern: "/articles/:id",
              meta: ({ params }) => ({ title: `Article ${params.id}` }),
            },
          ],
        }),
      ],
      server: { middlewareMode: true },
    });

    const html = await server.transformIndexHtml(
      "/articles/42",
      "<html><head></head><body></body></html>",
    );
    expect(html).toContain("<title>Article 42</title>");
  });

  it("resolves an async resolver", async () => {
    server = await createServer({
      root: "./test/fixtures/basic",
      plugins: [
        metaSSR({
          routes: [
            {
              pattern: "/articles/:id",
              meta: async ({ params }) => ({ title: `Async Article ${params.id}` }),
            },
          ],
        }),
      ],
      server: { middlewareMode: true },
    });

    const html = await server.transformIndexHtml(
      "/articles/99",
      "<html><head></head><body></body></html>",
    );
    expect(html).toContain("<title>Async Article 99</title>");
  });

  it("merges defaults with route meta", async () => {
    server = await createServer({
      root: "./test/fixtures/basic",
      plugins: [
        metaSSR({
          routes: [{ pattern: "/", meta: { title: "Home" } }],
          defaults: { twitterCard: "summary_large_image" },
        }),
      ],
      server: { middlewareMode: true },
    });

    const html = await server.transformIndexHtml("/", "<html><head></head><body></body></html>");
    expect(html).toContain("<title>Home</title>");
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });

  it("applies only defaults when no route matches", async () => {
    server = await createServer({
      root: "./test/fixtures/basic",
      plugins: [
        metaSSR({
          routes: [{ pattern: "/about", meta: { title: "About" } }],
          defaults: { title: "My App" },
        }),
      ],
      server: { middlewareMode: true },
    });

    const html = await server.transformIndexHtml("/", "<html><head></head><body></body></html>");
    expect(html).toContain("<title>My App</title>");
    expect(html).not.toContain("<title>About</title>");
  });
});
