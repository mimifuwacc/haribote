import type { Plugin, ResolvedConfig } from "vite";
import { resolveAndInject, resolveMeta } from "./resolver";
import type { MetaSSROptions } from "./types";

const CONFIG_FILE = "metadata.config.ts";
export const META_ENDPOINT = "/__meta";

async function loadUserConfig(root: string): Promise<MetaSSROptions | null> {
  const { loadConfigFromFile } = await import("vite");
  const result = await loadConfigFromFile(
    { command: "serve", mode: "development" },
    CONFIG_FILE,
    root,
  ).catch(() => null);

  const cfg = result?.config ?? null;
  if (cfg && typeof cfg === "object" && "routes" in cfg) {
    return cfg as MetaSSROptions;
  }
  return null;
}

export function metaSSR(inlineOptions?: MetaSSROptions): Plugin {
  let resolvedConfig: ResolvedConfig;
  let optionsPromise: Promise<MetaSSROptions | null> | null = null;

  function getOptions(): Promise<MetaSSROptions | null> {
    if (inlineOptions) return Promise.resolve(inlineOptions);
    if (!optionsPromise) {
      optionsPromise = loadUserConfig(resolvedConfig.root);
    }
    return optionsPromise;
  }

  return {
    name: "haribote",
    enforce: "pre",

    configResolved(config) {
      resolvedConfig = config;
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(META_ENDPOINT)) return next();

        const urlParam = new URL(req.url, "http://localhost").searchParams.get("url");

        if (!urlParam || !urlParam.startsWith("/") || urlParam.includes("://")) {
          res.statusCode = 400;
          res.end('{"error":"invalid url"}');
          return;
        }

        const options = await getOptions();
        const meta = options ? await resolveMeta(urlParam, options) : {};

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.statusCode = 200;
        res.end(JSON.stringify(meta));
      });
    },

    async transformIndexHtml(html, ctx) {
      const options = await getOptions();
      if (!options) return html;
      const url = ctx.originalUrl ?? ctx.path ?? "/";
      return resolveAndInject(html, url, options);
    },
  };
}
