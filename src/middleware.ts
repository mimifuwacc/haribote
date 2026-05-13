import type { IncomingMessage, ServerResponse } from "node:http";
import { resolveAndInject, resolveMeta } from "./resolver";
import { META_ENDPOINT } from "./plugin";
import type { MetaSSROptions } from "./types";

type NextFunction = (err?: unknown) => void;

export function createMetaHandler(options: MetaSSROptions) {
  return async (req: IncomingMessage, res: ServerResponse, next: NextFunction): Promise<void> => {
    if (!req.url?.startsWith(META_ENDPOINT)) return next();

    const urlParam = new URL(req.url, "http://localhost").searchParams.get("url");
    if (!urlParam || !urlParam.startsWith("/") || urlParam.includes("://")) {
      res.statusCode = 400;
      res.end('{"error":"invalid url"}');
      return;
    }

    const meta = await resolveMeta(urlParam, options);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.statusCode = 200;
    res.end(JSON.stringify(meta));
  };
}

export function createMiddleware(
  options: MetaSSROptions,
  getHtml: (url: string) => Promise<string>,
) {
  return async (req: IncomingMessage, res: ServerResponse, next: NextFunction): Promise<void> => {
    const accept = req.headers.accept ?? "";
    if (!accept.includes("text/html")) {
      return next();
    }

    try {
      const url = req.url ?? "/";
      const html = await getHtml(url);
      const injected = await resolveAndInject(html, url, options);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.statusCode = 200;
      res.end(injected);
    } catch (err) {
      next(err);
    }
  };
}
