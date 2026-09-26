/**
 * Formatting helpers shared by Ecomsia tools.
 * Locale-aware but dependency-free (Intl is built into every modern runtime).
 */

/** "il y a 3 min", "il y a 2 h", "il y a 5 j" — same buckets as the SaaS. */
export function relativeTimeFr(
  iso: string | number | Date | null | undefined,
  now: Date = new Date(),
): string {
  if (iso == null) return "jamais";
  const then = iso instanceof Date ? iso.getTime() : new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = now.getTime() - then;
  if (diff < 0) return "à l'instant";
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

/** Locale date: "12 sept. 2026" (fr-FR by default). */
export function formatDate(
  iso: string | number | Date | null | undefined,
  locale = "fr-FR",
): string {
  if (iso == null) return "—";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

/** Signed percentage: +12.5 % / -3 % / "—" for null-unknown values. */
export function percentSigned(value: number | null | undefined, locale = "fr-FR"): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value).toLocaleString(locale, { maximumFractionDigits: 1 });
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${abs} %`;
}

/** 1536 -> "1,5 ko" (fr-FR by default, binary units). */
export function formatBytes(bytes: number, locale = "fr-FR"): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["o", "ko", "Mo", "Go", "To"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const formatted = value.toLocaleString(locale, { maximumFractionDigits: 1 });
  return `${formatted} ${units[unit]}`;
}

/** Currency via Intl, EUR fr-FR by default: 12.5 -> "12,50 €". */
export function formatCurrency(value: number, currency = "EUR", locale = "fr-FR"): string {
  const formatted = new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  // Guard against non-breaking spaces sneaking into string comparisons in tests.
  return formatted.replace(/\u00a0|\u202f/g, " ");
}

/** Round to 2 decimals without float dust: 4.2000000001 -> 4.2. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
