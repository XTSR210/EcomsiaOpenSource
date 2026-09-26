/**
 * SEO helpers — generalized from Ecomsia's production `seo.ts`, without the
 * `import.meta` coupling so they run in any environment (Vite, Next, Node).
 */

export const SEO_LANGS = ["fr", "en", "es", "it", "pt", "de"] as const;
export type SeoLang = (typeof SEO_LANGS)[number];

export interface SeoLinksOptions {
  /** Site base URL without trailing slash, e.g. "https://ecomsia.fr". */
  baseUrl: string;
  /** Default language served at the bare URL (used for x-default). */
  defaultLang?: SeoLang;
  /** Query parameter carrying the language, "" for path-based i18n. */
  langParam?: string;
}

/**
 * hreflang link set for one page: one entry per language plus x-default
 * pointing at the default-language URL.
 */
export function hreflangLinks(pathname: string, options: SeoLinksOptions) {
  const base = options.baseUrl.replace(/\/+$/, "");
  const clean = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const langParam = options.langParam ?? "lang";
  const defaultLang = options.defaultLang ?? "fr";
  const localized = (lang: SeoLang) =>
    `${base}${clean}${lang === defaultLang || !langParam ? "" : `?${langParam}=${lang}`}`;
  return [
    ...SEO_LANGS.map((lang) => ({ rel: "alternate", hrefLang: lang, href: localized(lang) })),
    { rel: "alternate", hrefLang: "x-default", href: localized(defaultLang) },
  ];
}

/** Build a canonical URL: base + path, collapsing duplicate slashes safely. */
export function canonicalUrl(baseUrl: string, pathname: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path.replace(/\/{2,}/g, "/")}`;
}
