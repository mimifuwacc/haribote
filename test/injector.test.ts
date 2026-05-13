import { describe, it, expect } from "vitest";
import { buildMetaTags, injectIntoHtml } from "../src/injector";

describe("buildMetaTags", () => {
  it("generates og:title from title", () => {
    const tags = buildMetaTags({ title: "My Page" });
    expect(tags).toContain("<title>My Page</title>");
    expect(tags).toContain('property="og:title" content="My Page"');
  });

  it("ogTitle overrides title for og:title", () => {
    const tags = buildMetaTags({ title: "Base", ogTitle: "OG Title" });
    expect(tags).toContain('property="og:title" content="OG Title"');
    expect(tags).not.toContain('content="Base"');
  });

  it("generates og:description from description", () => {
    const tags = buildMetaTags({ description: "My desc" });
    expect(tags).toContain('name="description" content="My desc"');
    expect(tags).toContain('property="og:description" content="My desc"');
  });

  it("ogDescription overrides description for og:description", () => {
    const tags = buildMetaTags({ description: "base", ogDescription: "OG Desc" });
    expect(tags).toContain('property="og:description" content="OG Desc"');
    expect(tags).not.toContain('property="og:description" content="base"');
  });

  it("ogDescription can be set without description", () => {
    const tags = buildMetaTags({ ogDescription: "OG only" });
    expect(tags).toContain('property="og:description" content="OG only"');
    expect(tags).not.toContain('name="description"');
  });

  it("outputs og:image", () => {
    const tags = buildMetaTags({ ogImage: "https://example.com/img.png" });
    expect(tags).toContain('property="og:image" content="https://example.com/img.png"');
  });

  it("outputs og:url", () => {
    const tags = buildMetaTags({ ogUrl: "https://example.com/page" });
    expect(tags).toContain('property="og:url" content="https://example.com/page"');
  });

  it("outputs og:type", () => {
    const tags = buildMetaTags({ ogType: "article" });
    expect(tags).toContain('property="og:type" content="article"');
  });

  it("outputs twitter:card", () => {
    const tags = buildMetaTags({ twitterCard: "summary_large_image" });
    expect(tags).toContain('name="twitter:card" content="summary_large_image"');
  });

  it("outputs extra tag with name attribute", () => {
    const tags = buildMetaTags({ extra: [{ name: "robots", content: "noindex" }] });
    expect(tags).toContain('name="robots" content="noindex"');
  });

  it("outputs extra tag with property attribute", () => {
    const tags = buildMetaTags({ extra: [{ property: "og:locale", content: "en_US" }] });
    expect(tags).toContain('property="og:locale" content="en_US"');
  });

  it("escapes HTML in values", () => {
    const tags = buildMetaTags({ title: '<script>alert("xss")</script>' });
    expect(tags).not.toContain("<script>");
    expect(tags).toContain("&lt;script&gt;");
  });

  it("escapes double quotes in values", () => {
    const tags = buildMetaTags({ description: 'Say "hello"' });
    expect(tags).toContain("&quot;hello&quot;");
  });
});

describe("injectIntoHtml", () => {
  const baseHtml = "<html><head>\n  <title>Old</title>\n</head><body></body></html>";

  it("inserts tags before </head>", () => {
    const result = injectIntoHtml(baseHtml, "<title>New</title>");
    expect(result.indexOf("<title>New</title>")).toBeLessThan(result.indexOf("</head>"));
  });

  it("removes existing <title> to avoid duplicates", () => {
    const result = injectIntoHtml(baseHtml, "<title>New</title>");
    expect(result).not.toContain("<title>Old</title>");
    expect(result).toContain("<title>New</title>");
  });

  it("works with an empty <head>", () => {
    const html = "<html><head></head><body></body></html>";
    const result = injectIntoHtml(html, "<title>New</title>");
    expect(result).toContain("<title>New</title>");
  });
});
