import { describe, it, expect, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createMetaHandler, createMiddleware } from "../src/middleware";

function mockReq(url: string, accept = "application/json"): IncomingMessage {
  return { url, headers: { accept } } as unknown as IncomingMessage;
}

function mockRes() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: "",
    setHeader(key: string, val: string) {
      this.headers[key] = val;
    },
    end(body: string) {
      this.body = body;
    },
  };
}

const options = {
  routes: [{ pattern: "/", meta: { title: "Home", description: "Welcome" } }],
};

describe("createMetaHandler", () => {
  it("/__meta?url=/ returns meta JSON", async () => {
    const handler = createMetaHandler(options);
    const res = mockRes();
    const next = vi.fn();
    await handler(mockReq("/__meta?url=%2F"), res as unknown as ServerResponse, next);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ title: "Home", description: "Welcome" });
    expect(next).not.toHaveBeenCalled();
  });

  it("external URL returns 400", async () => {
    const handler = createMetaHandler(options);
    const res = mockRes();
    await handler(
      mockReq("/__meta?url=https%3A%2F%2Fevil.com"),
      res as unknown as ServerResponse,
      vi.fn(),
    );
    expect(res.statusCode).toBe(400);
  });

  it("missing url param returns 400", async () => {
    const handler = createMetaHandler(options);
    const res = mockRes();
    await handler(mockReq("/__meta"), res as unknown as ServerResponse, vi.fn());
    expect(res.statusCode).toBe(400);
  });

  it("non-/__meta path calls next", async () => {
    const handler = createMetaHandler(options);
    const next = vi.fn();
    await handler(mockReq("/other"), {} as ServerResponse, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("createMiddleware", () => {
  const getHtml = async () => "<html><head></head><body></body></html>";

  it("injects meta into HTML for text/html requests", async () => {
    const middleware = createMiddleware(options, getHtml);
    const res = mockRes();
    const next = vi.fn();
    await middleware(mockReq("/", "text/html"), res as unknown as ServerResponse, next);
    expect(res.body).toContain("<title>Home</title>");
    expect(res.headers["Content-Type"]).toContain("text/html");
    expect(next).not.toHaveBeenCalled();
  });

  it("passes non-HTML requests to next", async () => {
    const middleware = createMiddleware(options, getHtml);
    const next = vi.fn();
    await middleware(
      mockReq("/api/data", "application/json"),
      {} as ServerResponse,
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it("calls next on error", async () => {
    const middleware = createMiddleware(options, async () => {
      throw new Error("read failed");
    });
    const next = vi.fn();
    await middleware(mockReq("/", "text/html"), {} as ServerResponse, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
