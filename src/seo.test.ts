import { describe, expect, it } from "vitest";
import { canonicalUrl, hreflangLinks } from "./seo.js";
import { formatBytes, formatCurrency, percentSigned, relativeTimeFr } from "./format.js";

describe("hreflangLinks", () => {
  it("builds one link per language plus x-default on the default lang", () => {
    const links = hreflangLinks("/products", { baseUrl: "https://ecomsia.fr/" });
    expect(links).toHaveLength(7); // 6 langs + x-default
    expect(links).toContainEqual({
      rel: "alternate",
      hrefLang: "fr",
      href: "https://ecomsia.fr/products",
    });
    expect(links).toContainEqual({
      rel: "alternate",
      hrefLang: "en",
      href: "https://ecomsia.fr/products?lang=en",
    });
    expect(links.at(-1)).toEqual({
      rel: "alternate",
      hrefLang: "x-default",
      href: "https://ecomsia.fr/products",
    });
  });
});

describe("canonicalUrl", () => {
  it("normalizes base and path", () => {
    expect(canonicalUrl("https://ecomsia.fr/", "catalog//items")).toBe(
      "https://ecomsia.fr/catalog/items",
    );
  });
});

describe("format helpers", () => {
  it("formats relative time in French buckets", () => {
    const now = new Date("2026-09-26T12:00:00Z");
    expect(relativeTimeFr("2026-09-26T11:45:00Z", now)).toBe("il y a 15 min");
    expect(relativeTimeFr("2026-09-26T02:00:00Z", now)).toBe("il y a 10 h");
    expect(relativeTimeFr("2026-09-25T10:00:00Z", now)).toBe("il y a 1 j"); // ≥ 24 h -> jours
    expect(relativeTimeFr(null, now)).toBe("jamais");
    expect(relativeTimeFr("not-a-date", now)).toBe("—");
  });

  it("formats percentages with explicit sign and dash for unknown", () => {
    expect(percentSigned(12.5)).toBe("+12,5 %");
    expect(percentSigned(-3)).toBe("-3 %");
    expect(percentSigned(null)).toBe("—");
  });

  it("formats bytes in binary units", () => {
    expect(formatBytes(1536)).toBe("1,5 ko");
    expect(formatBytes(1024 * 1024)).toBe("1 Mo");
  });

  it("formats EUR currency", () => {
    expect(formatCurrency(12.5)).toBe("12,50 €");
  });
});
