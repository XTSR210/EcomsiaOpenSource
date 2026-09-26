<div align="center">

<img src="assets/logo-white.png" alt="Ecomsia" width="96" />

# Ecomsia Open Source

**Des briques génériques réutilisables, nées du développement d'[Ecomsia](https://ecomsia.fr) — plateforme e-commerce (import produit, fiches produit, automatisation, marketplaces).**

[![CI](https://github.com/XTSR210/EcomsiaOpenSource/actions/workflows/ci.yml/badge.svg)](https://github.com/XTSR210/EcomsiaOpenSource/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](tsconfig.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

> **Ce dépôt n'est pas le SaaS Ecomsia.** Le cœur de la plateforme (backend, logique métier, données fournisseurs, clés API) reste privé. Ici, on ne publie que des **outils génériques** utiles à tous les développeurs — e-commerce ou pas.

## Ce que vous trouverez ici

| Module | Description |
| --- | --- |
| [`src/product.ts`](src/product.ts) | Parsing & normalisation de données produit : prix multiformats (`"1 299,99 €"`, `"$1,299.99"`…), nettoyage d'URLs d'images, déspamification de titres, génération de titres d'annonce (budget 80 car. eBay) |
| [`src/text.ts`](src/text.ts) | Utilitaires texte : slugify, troncature intelligente, nettoyage du markdown produit par les IA, title case français, extraction de features |
| [`src/format.ts`](src/format.ts) | Formatage : temps relatif FR, dates localisées, pourcentages signés, octets, devises (Intl natif) |
| [`src/rateLimit.ts`](src/rateLimit.ts) | Rate limiter multi-instance (fenêtre fixe) avec store injectable — mémoire, SQL ou Redis |
| [`src/errors.ts`](src/errors.ts) | Description d'erreurs avec chaîne de causes complète + capture récupérable (quand un framework avale vos stacks) |
| [`src/seo.ts`](src/seo.ts) | Balises hreflang 6 langues + URLs canoniques |
| [`ui/`](ui/) | Composants React réutilisables (badge hexagonal Ecomsia, lockup logo) — [registre shadcn](registry.json) |
| [`assets/`](assets/) | Marque Ecomsia : logo officiel (PNG transparent), variante hexagonale (SVG) |

## Installation

```bash
# Utilisez directement les sources (copy-paste friendly, MIT)
git clone https://github.com/XTSR210/EcomsiaOpenSource.git

# ou les composants UI via le registre shadcn
npx shadcn@latest add "https://raw.githubusercontent.com/XTSR210/EcomsiaOpenSource/main/registry.json"
```

## Démarrage rapide

```ts
import { normalizeProduct, buildListingTitle, consumeRateLimit } from "./src/index.js";
import { slugify } from "./src/text.js";

// 1. Un produit fournisseur devient une fiche propre
const product = normalizeProduct(
  {
    title: "#!! Gourde Isotherme 1L - Stock FR",
    price: "1 299,99 €",
    images: ["https://img.example/gourde.jpg", "data:image/png;base64,xxx"],
  },
  slugify,
);
// { title: "Gourde Isotherme 1L", slug: "gourde-isotherme-1l", price: 1299.99, … }

// 2. Un titre d'annonce dans le budget eBay
buildListingTitle({ brand: "Anker", product: "Casque ANC", attributes: ["Bluetooth 5.3"] });
// "Anker Casque ANC Bluetooth 5.3"

// 3. Protéger un endpoint
const result = await consumeRateLimit({
  bucket: "product_import",
  key: userId,
  limit: 10,
  windowSeconds: 60,
});
if (!result.allowed) throw new Error(`Réessayez dans ${result.retryAfterSec}s`);
```

➡️ [Exemples d'intégration complets](docs/examples.md)

## Développement

```bash
npm install       # ou bun install
npm test          # vitest — 30+ tests unitaires
npm run typecheck # tsc --noEmit (strict)
npm run lint      # eslint
```

## Roadmap

- [ ] Parseur de flux marketplace (CSV/XML fournisseur générique)
- [ ] `@ecomsia/ui` publié sur npm
- [ ] Normalisation de catégories multi-marketplaces (eBay / Amazon / Etsy)
- [ ] Helpers de réconciliation de catalogues (détection de doublons produit)
- [ ] Traduction EN de la documentation

Les priorités suivent aussi les [issues ouvertes](https://github.com/XTSR210/EcomsiaOpenSource/issues) et les retours des contributeurs.

## Contribuer

Les contributions externes sont **explicitement recherchées** : nouvelles briques, améliorations, corrections, docs. Consultez le [guide de contribution](CONTRIBUTING.md) — le process est simple et la CI vous dit tout ce qui manque.

- 🐞 [Signaler un bug](.github/ISSUE_TEMPLATE/bug_report.yml)
- ✨ [Proposer une fonctionnalité](.github/ISSUE_TEMPLATE/feature_request.yml)
- 💬 [Discussions](https://github.com/XTSR210/EcomsiaOpenSource/discussions)

## Gouvernance & périmètre

Ce projet est maintenu par l'équipe Ecomsia et piloté par ses contributeurs :

1. Toute proposition passe par une issue publique ;
2. Les PR sont relues par un mainteneur, merged par squash ;
3. Le périmètre reste **générique** — aucune brique ne doit dépendre du cœur privé d'Ecomsia (voir [CONTRIBUTING.md](CONTRIBUTING.md#périmètre-important)).

## Licence

[MIT](LICENSE) — utilisez librement, y compris en usage commercial.
