import { resolveMeta } from "./resolver";
import type { MetaData, MetaSSROptions } from "./types";

function upsertMeta(attrs: Record<string, string>, content: string): void {
  const selector = Object.entries(attrs)
    .map(([k, v]) => `[${k}="${v}"]`)
    .join("");
  let el = document.head.querySelector<HTMLMetaElement>(`meta${selector}`);
  if (!el) {
    el = document.createElement("meta");
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function setMeta(meta: MetaData): void {
  if (meta.title) {
    document.title = meta.title;
  }

  const ogTitle = meta.ogTitle ?? meta.title;
  if (ogTitle) upsertMeta({ property: "og:title" }, ogTitle);

  const ogDesc = meta.ogDescription ?? meta.description;
  if (meta.description) upsertMeta({ name: "description" }, meta.description);
  if (ogDesc) upsertMeta({ property: "og:description" }, ogDesc);

  if (meta.ogImage) upsertMeta({ property: "og:image" }, meta.ogImage);
  if (meta.ogUrl) upsertMeta({ property: "og:url" }, meta.ogUrl);
  if (meta.ogType) upsertMeta({ property: "og:type" }, meta.ogType);
  if (meta.twitterCard) upsertMeta({ name: "twitter:card" }, meta.twitterCard);

  if (meta.extra) {
    for (const tag of meta.extra) {
      const attrs: Record<string, string> = {};
      if (tag.name) attrs.name = tag.name;
      if (tag.property) attrs.property = tag.property;
      upsertMeta(attrs, tag.content);
    }
  }
}

export async function matchMeta(options: MetaSSROptions, url: string): Promise<MetaData> {
  return resolveMeta(url, options);
}

export async function fetchMeta(url: string): Promise<MetaData> {
  const res = await fetch(`/__meta?url=${encodeURIComponent(url)}`);
  if (!res.ok) return {};
  return res.json() as Promise<MetaData>;
}
