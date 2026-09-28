/** The single way to build an internal URL: a leading slash, no trailing one. */
export function localePath(path: string, _locale?: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean !== "/" ? clean.replace(/\/+$/, "") : "/";
}
