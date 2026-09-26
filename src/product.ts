/**
 * Product data parsing & normalization — generic building blocks for
 * e-commerce automation. They accept messy, real-world supplier data and
 * produce clean structures ready for a listing, a feed or an LLM prompt.
 */

export interface RawProduct {
  title?: string | null;
  description?: string | null;
  price?: string | number | null;
  currency?: string | null;
  category?: string | null;
  images?: (string | null | undefined)[] | null;
  url?: string | null;
  sku?: string | null;
}

export interface NormalizedProduct {
  title: string;
  slug: string;
  description: string;
  /** Price as a plain number, or null when unparseable (never NaN). */
  price: number | null;
  currency: string;
  category: string | null;
  /** Absolute HTTP(S) URLs only, deduplicated, order preserved. */
  images: string[];
  url: string | null;
  sku: string | null;
}

const FALLBACK_CURRENCY = "EUR";

/** Parse "$1 299,99", "1 299.99 EUR", "12,90 €"… into a plain number. */
export function parsePrice(input: string | number | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  let s = input
    .replace(/\s|\u00a0|\u202f/g, "")
    .replace(/€/g, "")
    .replace(/(EUR|USD|GBP)/gi, "")
    .replace(/[^\d.,-]/g, ""); // strip any remaining symbol: $ £ ¥…
  if (!s) return null;
  const negative = s.startsWith("-") || s.endsWith("-");
  s = s.replace(/[-+]/g, "");
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // The right-most separator is the decimal one.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (hasComma) {
    // Comma is a decimal separator by default (French prices).
    // It is a thousands separator only for full 3-digit groups, 2+ of them
    // ("1,234,567") — a single group like "1,234" stays a decimal.
    const parts = s.split(",");
    const head = parts[0] ?? "";
    const allTriples = parts.length > 1 && /^\d{1,3}$/.test(head) && parts.slice(1).every((g) => /^\d{3}$/.test(g));
    s = allTriples && parts.length >= 3 ? s.replace(/,/g, "") : s.replace(",", ".");
  }
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

/** Keep only real image URLs, drop duplicates and data-URIs/tracking noise. */
export function cleanImageUrls(images: RawProduct["images"]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of images ?? []) {
    const url = (raw ?? "").trim();
    if (!url) continue;
    if (!/^https?:\/\//i.test(url)) continue; // data:, //relative, garbage
    const key = (url.split("#")[0] ?? url).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

const NOISE_INLINE: RegExp =
  /\b(frais de port offerts?|livraison (?:gratuite|rapide|offerte)(?: \d{1,3}\s?h)?|exp[eé]dition (?:rapide|48h|24h)|stock (?:fr|eu|limit[eé])|meilleur prix)\b/gi;

/** A trailing segment made only of shipping/stock marketing. */
const NOISE_SEGMENT: RegExp =
  /(livraison|exp[eé]dition|frais de port|stock|meilleur prix|promo)/i;

/** Remove marketplace spam from a product title without touching real info. */
export function cleanTitle(input: string): string {
  let s = input.replace(/^[\s#*!\-–|]+/, ""); // leading seller garbage (#!!, *…)
  s = s.replace(NOISE_INLINE, " ");
  const segments = s
    .split(/\s*[-–|]\s*/)
    .filter((seg) => seg.trim().length > 0 && !NOISE_SEGMENT.test(seg));
  return segments.join(" - ").replace(/!+/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Full normalization pipeline. `slug` is generated from the cleaned title;
 * unknown/empty fields degrade gracefully (never throws).
 */
export function normalizeProduct(raw: RawProduct, slugifyFn: (s: string) => string): NormalizedProduct {
  const title = cleanTitle(raw.title ?? "");
  return {
    title,
    slug: slugifyFn(title),
    description: (raw.description ?? "").trim(),
    price: parsePrice(raw.price),
    currency: (raw.currency ?? FALLBACK_CURRENCY).trim().toUpperCase() || FALLBACK_CURRENCY,
    category: raw.category?.trim() || null,
    images: cleanImageUrls(raw.images),
    url: raw.url?.trim() || null,
    sku: raw.sku?.trim() || null,
  };
}

/**
 * Build a marketplace-ready listing title from parts, respecting a hard
 * character budget (eBay: 80). Priority order: brand, product, attributes.
 */
export function buildListingTitle(parts: {
  brand?: string | null;
  product: string;
  attributes?: (string | null | undefined)[];
  max?: number;
}): string {
  const max = parts.max ?? 80;
  const attrs = (parts.attributes ?? []).filter((a): a is string => Boolean(a?.trim()));
  const candidates = [parts.brand?.trim(), parts.product.trim(), ...attrs.map((a) => a.trim())]
    .filter((p): p is string => Boolean(p));
  let out = "";
  for (const part of candidates) {
    const candidate = out ? `${out} ${part}` : part;
    if (candidate.length > max) break;
    out = candidate;
  }
  return out || parts.product.slice(0, max);
}
