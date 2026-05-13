import { describe, it, expect } from "vitest";
import { matchRoute } from "../src/matcher";

describe("matchRoute", () => {
  it("matches a static path", () => {
    const result = matchRoute([{ pattern: "/", meta: { title: "Home" } }], "/");
    expect(result).not.toBeNull();
    expect(result?.context.params).toEqual({});
  });

  it("extracts dynamic params", () => {
    const result = matchRoute(
      [{ pattern: "/articles/:id", meta: { title: "Article" } }],
      "/articles/123",
    );
    expect(result?.context.params).toEqual({ id: "123" });
  });

  it("ignores query string when matching", () => {
    const result = matchRoute(
      [{ pattern: "/search", meta: { title: "Search" } }],
      "/search?q=vite",
    );
    expect(result).not.toBeNull();
  });

  it("returns null when no route matches", () => {
    const result = matchRoute([{ pattern: "/about", meta: {} }], "/contact");
    expect(result).toBeNull();
  });

  it("prefers the first matching route", () => {
    const routes = [
      { pattern: "/articles/:id", meta: { title: "Dynamic" } },
      { pattern: "/articles/new", meta: { title: "Static" } },
    ];
    const result = matchRoute(routes, "/articles/new");
    expect((result?.route.meta as { title: string }).title).toBe("Dynamic");
  });

  it("extracts multiple params", () => {
    const result = matchRoute(
      [{ pattern: "/users/:userId/posts/:postId", meta: {} }],
      "/users/42/posts/7",
    );
    expect(result?.context.params).toEqual({ userId: "42", postId: "7" });
  });
});
