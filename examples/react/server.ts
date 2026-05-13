import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createMetaHandler, resolveAndInject } from "haribote";
import config from "./metadata.config.ts";

const dist = join(fileURLToPath(new URL(".", import.meta.url)), "dist");

const MIME: Record<string, string> = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const getHtml = () => readFile(join(dist, "index.html"), "utf-8");
const metaHandler = createMetaHandler(config);

createServer((req, res) => {
  metaHandler(req, res, async () => {
    const url = req.url ?? "/";
    const ext = extname(url);

    if (ext && ext !== ".html") {
      try {
        const content = await readFile(join(dist, url));
        res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
        res.statusCode = 200;
        res.end(content);
        return;
      } catch {}
    }

    try {
      const html = await getHtml();
      const injected = await resolveAndInject(html, url, config);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.statusCode = 200;
      res.end(injected);
    } catch (err) {
      res.statusCode = 500;
      res.end(String(err));
    }
  });
}).listen(3000, () => {
  console.log("http://localhost:3000");
});
