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
3. A `/__meta` endpoint is exposed so the client can fetch and apply meta tags on navigation

## Getting Started

```bash
pnpm create haribote@latest
```

## API

### `metaSSR(options?)`

Vite plugin. Pass options inline or omit to load from `metadata.config.ts`.

### `defineConfig(options)`

Type-safe wrapper for `metadata.config.ts`.

### `route(pattern, meta)`

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

### `fetchMeta(pathname)`

Fetches meta for a given pathname from `/__meta`.

### `setMeta(meta)`

Applies a `MetaData` object to the current document.

### `createHandler(config, getHtml)`

Creates a `(Request) => Promise<Response>` handler. Works with Node.js `http` and Cloudflare Workers.

### `createMiddleware(config)` / `createMetaHandler(config)`

Express/Connect middleware variants.
