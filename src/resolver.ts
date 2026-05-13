import { matchRoute } from "./matcher";
import { buildMetaTags, injectIntoHtml } from "./injector";
import type { MetaSSROptions, MetaData } from "./types";

export async function resolveMeta(url: string, options: MetaSSROptions): Promise<MetaData> {
  const matched = matchRoute(options.routes, url);
  let meta: MetaData = { ...options.defaults };

  if (matched) {
    const resolver = matched.route.meta;
    const resolved = typeof resolver === "function" ? await resolver(matched.context) : resolver;
    meta = { ...meta, ...resolved };
  }

  return meta;
}

export async function resolveAndInject(
  html: string,
  url: string,
  options: MetaSSROptions,
): Promise<string> {
  const meta = await resolveMeta(url, options);

  if (Object.keys(meta).length === 0) {
    return html;
  }

  const tags = buildMetaTags(meta);
  return injectIntoHtml(html, tags);
}
