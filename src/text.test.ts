import { describe, expect, it } from "vitest";
import { extractFeatures, slugify, titleCaseFr, truncate, cleanAiText } from "./text.js";

describe("slugify", () => {
  it.each([
    ["Crème solaire SPF 50+", "creme-solaire-spf-50"],
    ["Écouteurs sans fil — Édition 2026", "ecouteurs-sans-fil-edition-2026"],
    ["  déjà vu  ", "deja-vu"],
  ])("%s -> %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("truncate", () => {
  it("cuts on a word boundary and adds an ellipsis", () => {
    expect(truncate("Clef USB 3.0 haute vitesse", 15)).toBe("Clef USB 3.0…");
  });
  it("returns the input unchanged when it fits", () => {
    expect(truncate("Court", 15)).toBe("Court");
  });
});

describe("cleanAiText", () => {
  it("strips markdown artifacts from AI answers", () => {
    expect(cleanAiText("**Grande** autonomie\n## Batterie\n`40h`")).toBe(
      "Grande autonomie\nBatterie\n40h",
    );
  });
});

describe("titleCaseFr", () => {
  it("keeps minor words lowercase and preserves acronyms", () => {
    expect(titleCaseFr("clef usb de haute vitesse")).toBe("Clef USB de Haute Vitesse");
    expect(titleCaseFr("lot de 2 étuis pour telephone")).toBe("Lot de 2 Étuis pour Telephone");
  });
});

describe("extractFeatures", () => {
  it("turns bullet lines into a clean feature list", () => {
    expect(
      extractFeatures("- Batterie 40h\n* Charge rapide USB-C\n1. Garantie 2 ans"),
    ).toEqual(["Batterie 40h", "Charge rapide USB-C", "Garantie 2 ans"]);
  });
});
