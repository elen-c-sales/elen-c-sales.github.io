# Portfólio — Elen Camila Sales Silva

Portfólio profissional interativo com estética de **Grimório / Códice de Engenharia**, apresentando projetos de **Data Science**, **Machine Learning**, **Game Dev** e **Desenvolvimento Web**.

**Demo:** [https://elen.is-a.dev/](https://elen.is-a.dev/)

---

## Conceito

- **Mascote**: Diabrete do Pomodoro (familiar do códice) + CodeGhost (mascote flutuante)
- **Temas**: `manuscript` (claro), `candle` (escuro, padrão), `void` (secreto)
- **Tipografia**: `Cinzel` (títulos) · `Quicksand` (corpo) · `ElenPixel` (HUD/terminal, fonte pixel custom)
- **Acessibilidade**: conteúdo 100% acessível sem JS; `prefers-reduced-motion` respeitado

---

## Stack

- **Astro 6** — HTML estático por padrão, ilhas React, content layer, sitemap nativo
- **React 18** (ilhas) — `SecretsEngine`, `ProjectFilter`, `ThemeSwitcher`
- **CSS Custom Properties** — design system como contrato (tokens, temas, utilitários pixel)
- **MDX + Zod** — fonte única de verdade para projetos (`src/content/projects/*.mdx`)
- **GitHub Pages + Actions** — deploy automático com quality gates
- **Vitest** — testes da engine de segredos
- **LHCI** — budgets de performance/a11y

---

## Como rodar local

```bash
cd codex
npm ci
npm run dev        # http://localhost:4321
npm run check      # astro check + tsc
npm run test       # vitest
npm run build      # gera ./dist
```

---

## Estrutura

```
codex/
├── src/
│   ├── pages/          # index.astro, projetos/[slug].astro, arcanum.astro, 404.astro
│   ├── components/     # astro/ + react/
│   ├── content/        # projetos em MDX
│   ├── data/           # skills.ts
│   ├── lib/secrets/    # engine de segredos
│   └── styles/         # tokens, themes, global
├── public/             # assets estáticos (media, fonts, mascots, favicon)
└── tests/              # vitest
```

---

*Desenvolvido por Elen Camila Sales Silva.*
PY