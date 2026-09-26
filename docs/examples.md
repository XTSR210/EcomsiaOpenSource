# Exemples d'intégration

Snippets prêts à copier. Tous les helpers sont des fonctions pures TypeScript — aucun setup requis.

## 1. Normaliser un produit fournisseur

```ts
import { normalizeProduct } from "ecomsia-open-source";
import { slugify } from "ecomsia-open-source/text";

const raw = await fetch(supplierApiUrl).then((r) => r.json());

const product = normalizeProduct(
  {
    title: raw.name,               // "#!! Gourde Isotherme 1L - Stock FR"
    price: raw.price,              // "1 299,99 €"
    currency: raw.currency,
    images: raw.images,
    description: raw.description,
  },
  slugify,
);

// -> { title: "Gourde Isotherme 1L", slug: "gourde-isotherme-1l",
//      price: 1299.99, currency: "EUR", images: ["https://…"] }
```

## 2. Générer un titre d'annonce (budget 80 caractères eBay)

```ts
import { buildListingTitle } from "ecomsia-open-source";

const listing = buildListingTitle({
  brand: "Anker",
  product: "Casque bluetooth réduction de bruit active",
  attributes: ["ANC adaptatif", "Bluetooth 5.3", "Autonomie 40 h"],
  max: 80, // défaut : 80
});
// "Anker Casque bluetooth réduction de bruit active ANC adaptatif"
```

## 3. Protéger une server function (rate limiting)

```ts
import { consumeRateLimit, MemoryRateLimitStore } from "ecomsia-open-source";

// En production, branchez un store SQL/Redis atomique via `store`.
const store = new MemoryRateLimitStore();

export async function POST(request: Request) {
  const result = await consumeRateLimit({
    bucket: "product_import",
    key: request.headers.get("x-forwarded-for") ?? "anonymous",
    limit: 10,
    windowSeconds: 60,
    store,
  });

  if (!result.allowed) {
    return new Response("Trop de requêtes", {
      status: 429,
      headers: { "retry-after": String(result.retryAfterSec) },
    });
  }
  // …traitement
}
```

## 4. Logger une erreur avec sa chaîne de causes

```ts
import { describeError } from "ecomsia-open-source";

try {
  await importProducts();
} catch (error) {
  console.error(describeError(error));
  // Error: catalog sync failed
  //     at importProducts (…)
  // caused by: Error: supplier API 502 (status 502)
  //     at fetchBatch (…)
}
```

## 5. Balises hreflang multilingues

```ts
import { hreflangLinks, canonicalUrl } from "ecomsia-open-source";

const links = hreflangLinks("/catalogue", { baseUrl: "https://ecomsia.fr" });
// 7 balises <link rel="alternate"> : fr, en, es, it, pt, de + x-default
```

## 6. Badge hexagonal Ecomsia dans une app React

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/XTSR210/EcomsiaOpenSource/main/registry.json/hex-badge"
```

Ou copiez simplement `ui/hex-badge.tsx` dans votre projet (zéro dépendance runtime).
