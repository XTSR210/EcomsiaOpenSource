/**
 * Generic text helpers — reused across Ecomsia modules.
 * Pure functions only: no DOM, no Node APIs, safe everywhere.
 */

/** Remove diacritics ("café" -> "cafe"). */
export function stripDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * URL-safe slug: accents folded, lowercase, non-alphanumerics collapsed to "-".
 * @example slugify("Crème solaire SPF 50+") // "creme-solaire-spf-50"
 */
export function slugify(input: string): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Collapse consecutive whitespace (including newlines) into single spaces. */
export function normalizeSpaces(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/**
 * Truncate to `max` characters without cutting a word in half when possible.
 * Returns the original string when it already fits.
 */
export function truncate(input: string, max: number, suffix = "…"): string {
  if (input.length <= max) return input;
  const slice = input.slice(0, Math.max(0, max - suffix.length));
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > max * 0.5 ? slice.slice(0, lastSpace) : slice).trimEnd() + suffix;
}

/**
 * Clean AI-generated text before display. Assistants love markdown
 * (`**bold**`, `__underline__`, `` `code` ``, `## headings`) — strip it all
 * so the plain word is shown as-is. (Adapted from Ecomsia's production code.)
 */
export function cleanAiText(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1") // bold + italic
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold **
    .replace(/__(.+?)__/g, "$1") // bold __
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/^#{1,6}\s*/gm, ""); // headings
}

const FRENCH_MINOR_WORDS = new Set([
  "au", "aux", "avec", "de", "des", "du", "en", "et", "la", "le", "les",
  "pour", "sans", "sur", "un", "une",
]);

/** Tech acronyms e-commerce titles are full of — always uppercased. */
const KNOWN_ACRONYMS = new Set([
  "usb", "led", "lcd", "oled", "hdmi", "wifi", "bluetooth", "rgb", "anc",
  "spf", "gps", "nfc", "pcs", "ipega", "an-rgb", "ipx7", "usbc", "usb-c",
  "pd", "qc", "ulp", "irs", "sdk", "api", "ui", "ux", "ia", "pdf", "xml", "csv",
]);

/**
 * French-friendly title case: minor words (de, la, et…) stay lowercase unless
 * they open the title. "clef usb 3.0 de haute vitesse" -> "Clef USB 3.0 de Haute Vitesse".
 * Existing all-caps words (LED…) and known acronyms are preserved/uppercased.
 */
export function titleCaseFr(input: string): string {
  const words = normalizeSpaces(input).split(" ");
  return words
    .map((word, index) => {
      if (word.length > 1 && word === word.toUpperCase()) return word; // already USB, LED…
      const lower = word.toLowerCase();
      if (KNOWN_ACRONYMS.has(lower)) return lower.toUpperCase();
      if (index > 0 && FRENCH_MINOR_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/**
 * Extract feature bullets from free-form text: lines starting with
 * "-", "*", "•" or "1." become array items, marketing noise removed.
 */
export function extractFeatures(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => normalizeSpaces(line))
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^(?:[-*•]|\d+[.)])\s*/, ""))
    .map((line) => line.replace(/!{2,}/g, "!"))
    .filter((line) => line.length > 1);
}
