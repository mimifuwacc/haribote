import { createHandler } from "haribote";
import config from "./metadata.config";

type Env = {
  ASSETS: { fetch(req: Request | string): Promise<Response> };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (/\.[^./]+$/.test(url.pathname) && !url.pathname.endsWith(".html")) {
      return env.ASSETS.fetch(request);
    }

    return createHandler(config, async () => {
      const res = await env.ASSETS.fetch(new URL("/index.html", request.url).toString());
      return res.text();
    })(request);
  },
};
