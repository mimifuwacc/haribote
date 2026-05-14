import type { RouteConfig, RouteContext } from "./types";

export interface MatchResult {
  route: RouteConfig;
  context: RouteContext;
}

function compilePattern(pattern: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];
  const regexStr = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    })
    .replace(/\*/g, "(.*)");
  return { regex: new RegExp(`^${regexStr}$`), keys };
}

export function matchRoute(routes: RouteConfig[], url: string): MatchResult | null {
  const pathname = new URL(url, "http://localhost").pathname;

  for (const route of routes) {
    const { regex, keys } = compilePattern(route.pattern);
    const result = regex.exec(pathname);
    if (result) {
      const params: Record<string, string> = {};
      keys.forEach((key, i) => {
        params[key] = decodeURIComponent(result[i + 1] ?? "");
      });
      return { route, context: { params, url } };
    }
  }
  return null;
}
