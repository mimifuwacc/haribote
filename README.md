# haribote

A Vite plugin that SSRs only meta tags, leaving everything else as CSR.

## Motivation

Inspired by [this thread](https://x.com/sushichan044/status/2054205568383135762).

That thread made me nod. For most apps, full SSR is more complexity than it's worth — and complexity compounds.

But I still want correct meta tags. That's the one thing a plain SPA can't do well: `<title>` and OG tags need to be in the HTML before it's served, not patched in after the JS runs.

haribote gives you the middle ground: your app stays a plain SPA, but each page gets the right meta tags injected server-side before the HTML is served.

## How it works

1. You define meta tags per route in `metadata.config.ts`
2. On each request, haribote injects the matching meta tags into `index.html` before serving it
3. A `/__meta` API endpoint is exposed so the client can fetch and apply meta tags on navigation

## Installation

```bash
npm install haribote
```

## Setup

### `vite.config.ts`

```ts
import { defineConfig } from "vite";
import { metaSSR } from "haribote";

export default defineConfig({
  plugins: [metaSSR()],
});
```

### `metadata.config.ts`

```ts
import { defineConfig, route } from "haribote";

export default defineConfig({
  defaults: {
    twitterCard: "summary_large_image",
  },
  routes: [
    route("/", {
      title: "Home | My App",
      description: "Welcome to my app",
      ogImage: "https://example.com/og-home.png",
    }),
    route("/about", {
      title: "About | My App",
      description: "About this app",
    }),
    route("/articles/:id", async ({ params }) => ({
      title: `Article ${params.id} | My App`,
      description: `Article ${params.id}`,
    })),
  ],
});
```

### Client-side navigation

Call `fetchMeta` + `setMeta` whenever the route changes to keep meta tags in sync:

```ts
import { fetchMeta, setMeta } from "haribote/client";

// after each navigation
setMeta(await fetchMeta(location.pathname));
```

## API

### Plugin

#### `metaSSR(options?)`

Vite plugin. Pass options inline or omit to load from `metadata.config.ts`.

### Config

#### `defineConfig(options)`

Type-safe wrapper for `metadata.config.ts`.

#### `route(pattern, meta)`

Defines a route. `pattern` supports path parameters (`:id`, etc.). `meta` can be a static object or an async function receiving `{ params, url }`.

### MetaData fields

| Field           | Description                                      |
| --------------- | ------------------------------------------------ |
| `title`         | `<title>` and `og:title`                         |
| `description`   | `<meta name="description">` and `og:description` |
| `ogTitle`       | Overrides `og:title`                             |
| `ogDescription` | Overrides `og:description`                       |
| `ogImage`       | `og:image`                                       |
| `ogUrl`         | `og:url`                                         |
| `ogType`        | `og:type`                                        |
| `twitterCard`   | `twitter:card`                                   |
| `extra`         | Any additional `<meta>` tags                     |

### Client

#### `fetchMeta(pathname)`

Fetches meta for a given pathname from `/__meta`.

#### `setMeta(meta)`

Applies a `MetaData` object to the current document.

### Server

#### `createHandler(options, getHtml)`

Creates a `(Request) => Promise<Response>` handler that injects meta tags into HTML and exposes the `/__meta` endpoint. Works with Node.js `http` and Cloudflare Workers.

### Production

#### Node.js

Use `createHandler` to serve your app with meta injection:

```ts
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createHandler } from "haribote";
import config from "./metadata.config.ts";

const handle = createHandler(config, () => readFile("dist/index.html", "utf-8"));

createServer(async (req, res) => {
  const response = await handle(new Request(new URL(req.url, "http://localhost")));
  res.statusCode = response.status;
  for (const [k, v] of response.headers) res.setHeader(k, v);
  res.end(await response.text());
}).listen(3000);
```

For Express/Connect, use `createMiddleware` instead.

#### Cloudflare Workers

```ts
import { createHandler } from "haribote";
import config from "./metadata.config";

export default {
  async fetch(request, env) {
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
```

`wrangler.jsonc`:

```jsonc
{
  "main": "worker.ts",
  "compatibility_date": "2026-01-01",
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist",
    "run_worker_first": true,
  },
}
```

## Examples

- [React](./examples/react)
- [React Router](./examples/react-router)
- [Vue Router](./examples/vue)
