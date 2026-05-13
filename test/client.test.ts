// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setMeta, fetchMeta, matchMeta } from "../src/client";

describe("setMeta", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
  });

  it("sets document.title", () => {
    setMeta({ title: "My Page" });
    expect(document.title).toBe("My Page");
  });

  it("creates og:title meta tag", () => {
    setMeta({ title: "My Page" });
    const el = document.head.querySelector<HTMLMetaElement>('[property="og:title"]');
    expect(el?.getAttribute("content")).toBe("My Page");
  });

  it("creates description meta tag", () => {
    setMeta({ description: "Hello" });
    const el = document.head.querySelector<HTMLMetaElement>('[name="description"]');
    expect(el?.getAttribute("content")).toBe("Hello");
  });

  it("creates og:description meta tag from description", () => {
    setMeta({ description: "Hello" });
    const el = document.head.querySelector<HTMLMetaElement>('[property="og:description"]');
    expect(el?.getAttribute("content")).toBe("Hello");
  });

  it("updates existing meta tag without creating duplicates", () => {
    setMeta({ title: "First" });
    setMeta({ title: "Second" });
    const els = document.head.querySelectorAll('[property="og:title"]');
    expect(els.length).toBe(1);
    expect(els[0].getAttribute("content")).toBe("Second");
  });

  it("creates og:image meta tag", () => {
    setMeta({ ogImage: "https://example.com/img.png" });
    const el = document.head.querySelector<HTMLMetaElement>('[property="og:image"]');
    expect(el?.getAttribute("content")).toBe("https://example.com/img.png");
  });

  it("creates twitter:card meta tag", () => {
    setMeta({ twitterCard: "summary_large_image" });
    const el = document.head.querySelector<HTMLMetaElement>('[name="twitter:card"]');
    expect(el?.getAttribute("content")).toBe("summary_large_image");
  });

  it("creates extra tag with name attribute", () => {
    setMeta({ extra: [{ name: "robots", content: "noindex" }] });
    const el = document.head.querySelector<HTMLMetaElement>('[name="robots"]');
    expect(el?.getAttribute("content")).toBe("noindex");
  });

  it("creates extra tag with property attribute", () => {
    setMeta({ extra: [{ property: "og:locale", content: "en_US" }] });
    const el = document.head.querySelector<HTMLMetaElement>('[property="og:locale"]');
    expect(el?.getAttribute("content")).toBe("en_US");
  });

  it("updates extra tag without creating duplicates on re-render", () => {
    setMeta({ extra: [{ name: "robots", content: "noindex" }] });
    setMeta({ extra: [{ name: "robots", content: "index,follow" }] });
    const els = document.head.querySelectorAll('[name="robots"]');
    expect(els.length).toBe(1);
    expect(els[0].getAttribute("content")).toBe("index,follow");
  });

  it("updates extra property tag without creating duplicates on re-render", () => {
    setMeta({ extra: [{ property: "og:locale", content: "en_US" }] });
    setMeta({ extra: [{ property: "og:locale", content: "ja_JP" }] });
    const els = document.head.querySelectorAll('[property="og:locale"]');
    expect(els.length).toBe(1);
    expect(els[0].getAttribute("content")).toBe("ja_JP");
  });
});

describe("fetchMeta", () => {
  it("fetches meta from /__meta endpoint", async () => {
    const mockMeta = { title: "Fetched", description: "From server" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockMeta) }),
    );
    const result = await fetchMeta("/about");
    expect(fetch).toHaveBeenCalledWith("/__meta?url=%2Fabout");
    expect(result).toEqual(mockMeta);
  });

  it("returns empty object on error response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const result = await fetchMeta("/missing");
    expect(result).toEqual({});
  });
});

describe("matchMeta", () => {
  const options = {
    routes: [
      { pattern: "/", meta: { title: "Home" } },
      {
        pattern: "/articles/:id",
        meta: ({ params }: { params: Record<string, string> }) => ({
          title: `Article ${params.id}`,
        }),
      },
    ],
  };

  it("resolves static route meta", async () => {
    const meta = await matchMeta(options, "/");
    expect(meta.title).toBe("Home");
  });

  it("resolves dynamic route meta", async () => {
    const meta = await matchMeta(options, "/articles/42");
    expect(meta.title).toBe("Article 42");
  });

  it("returns empty object for unmatched route", async () => {
    const meta = await matchMeta(options, "/unknown");
    expect(meta).toEqual({});
  });
});
