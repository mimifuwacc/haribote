import { match } from "path-to-regexp";
import type { RouteConfig, RouteContext } from "./types";

export interface MatchResult {
  route: RouteConfig;
  context: RouteContext;
}

export function matchRoute(routes: RouteConfig[], url: string): MatchResult | null {
  const pathname = new URL(url, "http://localhost").pathname;

  for (const route of routes) {
    const matcher = match(route.pattern, { decode: decodeURIComponent });
    const result = matcher(pathname);
    if (result) {
      return {
        route,
        context: {
          params: result.params as Record<string, string>,
          url,
        },
      };
    }
  }
  return null;
}
