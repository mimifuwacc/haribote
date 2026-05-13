import { resolveMeta, resolveAndInject } from "./resolver";
import type { MetaSSROptions } from "./types";

const META_ENDPOINT = "/__meta";

export function createHandler(options: MetaSSROptions, getHtml: () => Promise<string>) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);

    if (url.pathname.startsWith(META_ENDPOINT)) {
      const urlParam = url.searchParams.get("url");
      if (!urlParam || !urlParam.startsWith("/") || urlParam.includes("://")) {
        return new Response('{"error":"invalid url"}', {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      const meta = await resolveMeta(urlParam, options);
      return new Response(JSON.stringify(meta), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const html = await getHtml();
    const injected = await resolveAndInject(html, url.pathname + url.search, options);
    return new Response(injected, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  };
}
