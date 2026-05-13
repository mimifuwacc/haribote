import type { MetaData } from "./types";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildMetaTags(meta: MetaData): string {
  const tags: string[] = [];

  if (meta.title) {
    tags.push(`<title>${escapeHtml(meta.title)}</title>`);
    tags.push(`<meta property="og:title" content="${escapeHtml(meta.title)}">`);
  }

  if (meta.ogTitle) {
    const idx = tags.findIndex((t) => t.includes('property="og:title"'));
    const tag = `<meta property="og:title" content="${escapeHtml(meta.ogTitle)}">`;
    if (idx >= 0) tags[idx] = tag;
    else tags.push(tag);
  }

  if (meta.description) {
    tags.push(`<meta name="description" content="${escapeHtml(meta.description)}">`);
    tags.push(`<meta property="og:description" content="${escapeHtml(meta.description)}">`);
  }

  if (meta.ogDescription) {
    const idx = tags.findIndex((t) => t.includes('property="og:description"'));
    const tag = `<meta property="og:description" content="${escapeHtml(meta.ogDescription)}">`;
    if (idx >= 0) tags[idx] = tag;
    else tags.push(tag);
  }

  if (meta.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(meta.ogImage)}">`);
  }

  if (meta.ogUrl) {
    tags.push(`<meta property="og:url" content="${escapeHtml(meta.ogUrl)}">`);
  }

  if (meta.ogType) {
    tags.push(`<meta property="og:type" content="${escapeHtml(meta.ogType)}">`);
  }

  if (meta.twitterCard) {
    tags.push(`<meta name="twitter:card" content="${escapeHtml(meta.twitterCard)}">`);
  }

  if (meta.extra) {
    for (const tag of meta.extra) {
      const attrs = [
        tag.name ? `name="${escapeHtml(tag.name)}"` : "",
        tag.property ? `property="${escapeHtml(tag.property)}"` : "",
        `content="${escapeHtml(tag.content)}"`,
      ]
        .filter(Boolean)
        .join(" ");
      tags.push(`<meta ${attrs}>`);
    }
  }

  return tags.join("\n    ");
}

export function injectIntoHtml(html: string, metaTags: string): string {
  const withoutTitle = html.replace(/<title>[^<]*<\/title>/i, "");
  return withoutTitle.replace("</head>", `  ${metaTags}\n  </head>`);
}
