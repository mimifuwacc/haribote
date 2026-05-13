export interface MetaData {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  extra?: Array<{ name?: string; property?: string; content: string }>;
}

export interface RouteContext {
  params: Record<string, string>;
  url: string;
}

export type MetaResolver = MetaData | ((ctx: RouteContext) => MetaData | Promise<MetaData>);

export interface RouteConfig {
  pattern: string;
  meta: MetaResolver;
}

export interface MetaSSROptions {
  routes: RouteConfig[];
  defaults?: MetaData;
}

export function route(pattern: string, meta: MetaResolver): RouteConfig {
  return { pattern, meta };
}

export function defineRoutes(routes: RouteConfig[]): RouteConfig[] {
  return routes;
}

export function defineConfig(options: MetaSSROptions): MetaSSROptions {
  return options;
}
