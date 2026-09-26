# Merci de contribuer à Ecomsia Open Source 🎉

Ce dépôt vit grâce aux contributions externes : issues, pull requests, retours d'usage — tout est bienvenu.

## Avant de commencer

- **Cherchez une issue existante** avant d'en ouvrir une nouvelle.
- Les questions d'usage → label `question`.
- Les nouveautés → ouvrez d'abord une issue `feature` pour en discuter (évite les PR refusées).

## Environnement de développement

```bash
# Prérequis : Node 20+, Bun ou npm au choix
bun install        # ou npm install
bun run typecheck  # tsc --noEmit
bun test           # vitest
bun run lint       # eslint
```

## Règles du projet

1. **Fonctions pures d'abord** — pas d'effet de bord dans `src/`, pas d'accès disque/réseau sans injection.
2. **Tests obligatoires** — toute nouvelle fonction arrive avec ses tests vitest (`*.test.ts` à côté du module).
3. **Zéro secret, zéro métier** — rien sur l'infrastructure Ecomsia, les clés API, les fournisseurs ou la base de données. Le cœur du SaaS reste privé.
4. **TypeScript strict** — `strict: true`, pas de `any` non justifié.
5. **Style** — le linter fait foi (`bun run lint` avant de pousser).

## Format des commits

[Conventional Commits](https://www.conventionalcommits.org/fr/) :

```
feat(product): add supplier availability parsing
fix(format): handle negative percentages in percentSigned
docs: expand rate limiting example
```

## Process des pull requests

1. Forkez → branche `feat/…` ou `fix/…`.
2. Commits conventionnels, un sujet par PR.
3. La CI doit passer (typecheck + tests + lint).
4. Un mainteneur relit — merge par squash.

## Périmètre (important)

Ce dépôt publie des **briques génériques** : parseurs produit, formatage, rate limiting, helpers SEO, composants UI réutilisables. Si votre proposition dépend de données privées d'Ecomsia, elle n'a pas sa place ici — décrivez plutôt la brique générique équivalente.
