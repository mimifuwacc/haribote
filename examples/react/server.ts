import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createFetchHandler } from "haribote";
import config from "./metadata.config.ts";

const dist = join(fileURLToPath(new URL(".", import.meta.url)), "dist");

const MIME: Record<string, string> = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const handle = createFetchHandler(config, () => readFile(join(dist, "index.html"), "utf-8"));

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const ext = extname(url.pathname);

  if (ext && ext !== ".html") {
    try {
      const content = await readFile(join(dist, url.pathname));
      res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
      res.statusCode = 200;
      res.end(content);
      return;
    } catch {}
  }

  const response = await handle(new Request(url, { method: req.method }));
  res.statusCode = response.status;
  for (const [key, value] of response.headers.entries()) res.setHeader(key, value);
  res.end(await response.text());
}).listen(3000, () => {
  console.log("http://localhost:3000");
});
