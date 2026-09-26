import { describe, expect, it } from "vitest";
import {
  cleanImageUrls,
  buildListingTitle,
  normalizeProduct,
  parsePrice,
  cleanTitle,
} from "./product.js";
import { slugify } from "./text.js";

describe("parsePrice", () => {
  it.each([
    ["1 299,99 €", 1299.99],
    ["$1,299.99", 1299.99],
    ["12,90", 12.9],
    ["1.234,56 EUR", 1234.56],
    [42, 42],
    ["  9,99  ", 9.99],
    ["1,234", 1.234], // 3 decimals after comma = not a thousands separator
    ["-5,00 €", -5],
    [null, null],
    ["", null],
    ["N/A", null],
  ])("parses %s -> %s", (input, expected) => {
    expect(parsePrice(input as string)).toBe(expected);
  });
});

describe("cleanImageUrls", () => {
  it("keeps only absolute http(s) urls and dedupes", () => {
    const out = cleanImageUrls([
      "https://img.example/a.jpg",
      "https://img.example/a.jpg",
      "data:image/png;base64,xxxx",
      "//cdn.example/relative.png",
      "  https://img.example/b.jpg?x=1#frag  ",
      null,
      undefined,
    ]);
    expect(out).toEqual(["https://img.example/a.jpg", "https://img.example/b.jpg?x=1#frag"]);
  });
});

describe("cleanTitle", () => {
  it("removes marketplace spam but keeps real info", () => {
    expect(cleanTitle("#!! Casque Bluetooth ANC - Livraison rapide 48h")).toBe(
      "Casque Bluetooth ANC",
    );
    expect(cleanTitle("Montre connectée !! Frais de port offerts")).toBe("Montre connectée");
    expect(cleanTitle("Souris gamer RGB 7200 DPI")).toBe("Souris gamer RGB 7200 DPI");
  });
});

describe("normalizeProduct", () => {
  it("normalizes a messy supplier product end to end", () => {
    const out = normalizeProduct(
      {
        title: "#!! Gourde Isotherme 1L - Stock FR",
        price: "1 299,99 €",
        currency: "eur",
        images: ["https://img.example/gourde.jpg", "javascript:alert(1)"],
        description: "  Garde froid 24h.  ",
      },
      slugify,
    );
    expect(out).toEqual({
      title: "Gourde Isotherme 1L",
      slug: "gourde-isotherme-1l",
      description: "Garde froid 24h.",
      price: 1299.99,
      currency: "EUR",
      category: null,
      images: ["https://img.example/gourde.jpg"],
      url: null,
      sku: null,
    });
  });
});

describe("buildListingTitle", () => {
  it("respects the 80-char marketplace budget and priority order", () => {
    const title = buildListingTitle({
      brand: "Ecomsia",
      product: "Casque bluetooth à réduction de bruit active très longues sessions",
      attributes: ["ANC", "Bluetooth 5.3", "autonomie 40h"],
    });
    expect(title.length).toBeLessThanOrEqual(80);
    expect(title.startsWith("Ecomsia")).toBe(true);
  });

  it("falls back to a truncated product name when nothing fits", () => {
    const title = buildListingTitle({ product: "x".repeat(120), max: 40 });
    expect(title.length).toBe(40);
  });
});
