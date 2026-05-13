import { describe, it, expect } from "vitest";
import { resolveMeta, resolveAndInject } from "../src/resolver";

const routes = [
  { pattern: "/", meta: { title: "Home", description: "Welcome" } },
  { pattern: "/about", meta: { title: "About" } },
  {
    pattern: "/articles/:id",
    meta: ({ params }: { params: Record<string, string> }) => ({
      title: `Article ${params.id}`,
    }),
  },
  {
    pattern: "/async/:slug",
    meta: async ({ params }: { params: Record<string, string> }) => ({
      title: `Async ${params.slug}`,
    }),
  },
];

describe("resolveMeta", () => {
  it("resolves static route meta", async () => {
    const meta = await resolveMeta("/", { routes });
    expect(meta).toEqual({ title: "Home", description: "Welcome" });
  });

  it("resolves function meta with params", async () => {
    const meta = await resolveMeta("/articles/42", { routes });
    expect(meta.title).toBe("Article 42");
  });

  it("resolves async function meta", async () => {
    const meta = await resolveMeta("/async/hello", { routes });
    expect(meta.title).toBe("Async hello");
  });

  it("returns empty object when no match and no defaults", async () => {
    const meta = await resolveMeta("/missing", { routes });
    expect(meta).toEqual({});
  });

  it("returns defaults when no route matches", async () => {
    const meta = await resolveMeta("/missing", {
      routes,
      defaults: { twitterCard: "summary_large_image" },
    });
    expect(meta).toEqual({ twitterCard: "summary_large_image" });
  });

  it("merges defaults with route meta, route wins on conflict", async () => {
    const meta = await resolveMeta("/", {
      routes,
      defaults: { title: "Default", twitterCard: "summary" },
    });
    expect(meta.title).toBe("Home");
    expect(meta.twitterCard).toBe("summary");
    expect(meta.description).toBe("Welcome");
  });

  it("defaults are merged even when route meta is from a function", async () => {
    const meta = await resolveMeta("/articles/5", {
      routes,
      defaults: { ogType: "article" },
    });
    expect(meta.title).toBe("Article 5");
    expect(meta.ogType).toBe("article");
  });
});

describe("resolveAndInject", () => {
  const html = "<html><head><title>Old</title></head><body></body></html>";
  const options = { routes };

  it("injects meta tags into HTML", async () => {
    const result = await resolveAndInject(html, "/", options);
    expect(result).toContain("<title>Home</title>");
    expect(result).toContain('name="description" content="Welcome"');
    expect(result).not.toContain("<title>Old</title>");
  });

  it("returns original HTML when no meta resolves", async () => {
    const result = await resolveAndInject(html, "/missing", options);
    expect(result).toBe(html);
  });

  it("returns original HTML when options have empty routes and no defaults", async () => {
    const result = await resolveAndInject(html, "/", { routes: [] });
    expect(result).toBe(html);
  });

  it("injects defaults-only meta when no route matches", async () => {
    const result = await resolveAndInject(html, "/missing", {
      routes,
      defaults: { title: "My App" },
    });
    expect(result).toContain("<title>My App</title>");
  });

  it("resolves async function meta and injects", async () => {
    const result = await resolveAndInject(html, "/async/world", options);
    expect(result).toContain("<title>Async world</title>");
  });
});
