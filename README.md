# Portfólio: Elen Camila Sales Silva
### Cientista de Dados & Desenvolvedora Full-Stack

Este repositório contém o código-fonte do meu portfólio profissional, desenvolvido com foco em apresentar meus projetos de **Data Science**, **Machine Learning**, **Game Dev** e **Desenvolvimento Web**.

## Demo Online
Acesse o portfólio interativo: [https://elen.is-a.dev/](https://elen.is-a.dev/)

---

## Conceito & Identidade
O design segue a estética de **Grimório / Códice de Engenharia** — capítulos, bestiário, grimório, correspondência — com tom *dark fantasy / arcano* (referências: *Tunic*, *Inscryption*, *Loop Hero*).

- **Mascote**: Diabrete do Pomodoro (pixel art) = familiar do códice
- **Temas**: `manuscript` (claro), `candle` (escuro, default), `void` (secreto, desbloqueável via Konami)
- **Tipografia**: `Cinzel` (títulos) · `Quicksand` (corpo) · `Press Start 2P` (HUD/terminal)
- **Regra de ouro**: Ovo de páscoa = recompensa, nunca portão. Conteúdo 100% acessível sem JS.

---

## Stack Tecnológica deste Site
Framework estático moderno com *progressive enhancement*:

* **Astro 6** — HTML estático por padrão, ilhas React, content layer, sitemap nativo
* **React 18** (ilhas) — Só 4 componentes hidratados: `SecretsEngine` (HUD + Terminal + Toasts), `ProjectFilter`, `ThemeSwitcher`
* **CSS Custom Properties** — Design system como contrato (tokens, temas, utilitários pixel), zero runtime
* **MDX + Zod** (`src/content/projects/*.mdx`) — Fonte única de verdade para projetos
* **GitHub Pages + Actions** — Deploy automático com quality gates (check, test, build, LHCI)
* **Vitest** — Testes da engine de segredos (lógica pura) + smoke de build
* **LHCI** — Budgets: perf ≥ 0.7, a11y ≥ 0.9, best-practices ≥ 0.9, seo ≥ 0.65

> **Não usar:** Tailwind, SPA routing, client-side rendering de conteúdo, bibliotecas de animação pesadas.

---

## Arquitetura de Informação (Capítulos)
```
index.astro (home)
├── HUD (barra fixa topo): sigil + nome | ThemeSwitcher + TerminalToggle + SecretsCounter
├── Prólogo          → hero + sobre
├── Bestiário        → grid de projetos (filtro por família via ProjectFilter island)
│   ├── Jogos & Pixel     (Pomodoro Diabrete, GUNSHIP CQB, Dino Run, Asteroids, Raycasting, Doom Fire)
│   ├── Dados             (Inadimplência BR, Inadimplência vs Consumo, INMET)
│   ├── Web & Apps        (Elen4Devs, ZenCalc, YT Downloader)
│   └── Visão             (PyOpenCV FaceRec)
├── Grimório         → stack como "feitiços" com proficiência (skills.ts)
├── Crônicas         → (futuro: blog leve / learnings)
└── Correspondência  → contato (email, GitHub, LinkedIn)

projetos/[slug].astro → página estática por projeto (getStaticPaths do content layer)
arcanum.astro         → página secreta (noindex), lore + terminal hint
404.astro             → "perdido no abismo" + link home
```

**Rótulos funcionais sempre profissionais** ("Projetos", "Stack", "Contato"). Sabor arcano só em subtítulo/marginalia.

---

## Segredos — Engine Declarativa
9 segredos declarativos em `src/lib/secrets/definitions.ts`:

| ID | Trigger | Recompensa |
|---|---|---|
| `console` | DevTools aberto | Hint: terminal responde a `` ` `` |
| `terminal` | Abrir terminal (`~`) | Página `/arcanum` |
| `konami` | ↑↑↓↓←→←→BA | Tema `void` desbloqueado |
| `diabrete` | 5 cliques no diabrete (prólogo) | Achievement: "Amigo do Diabrete" |
| `sigil` | Clique no sigil do rodapé | Página `/arcanum` |
| `midnight` | Visita 00:00–01:00 | Toast especial |
| `gunship-egg` | Visita projeto GUNSHIP CQB | Hint na página |
| `dino-egg` | Visita Dino Run Vecna | Hint na página |
| `arcanum-read` | Leitura de `/arcanum` | Achievement: "Conhecimento Proibido" |

- Lógica pura em `src/lib/secrets/logic.ts` (testável)
- Persistência cross-session em `localStorage` (`codex.secrets.v1`)
- HUD exibe contador: **`Segredos: 3/9`** (progressivo, não bloqueante)
- Terminal (`~` ou botão HUD): comandos `help`, `ls`, `open <slug>`, `theme <name>`, `secret`, `whoami`, `clear`
- Acessibilidade: `aria-live` anuncia conquistas, `prefers-reduced-motion` desliga transições, teclado nunca sequestrado

---

## Projetos Destacados (no Bestiário)
- **Pomodoro Diabrete** — Timer pixel art com familiar que cansa no foco e revive na pausa (Python/Pygame)
- **GUNSHIP CQB** — Simulador tático de combate espacial 3D (Python/Pygame/OpenGL)
- **Inadimplência no Brasil** — Dashboard Shiny com dados do Banco Central (R/Shiny/Plotly)
- **Doom Fire** — Estudo do efeito de fogo estilo Doom (Python/Pygame/NumPy)
- **PyOpenCV FaceRec** — Reconhecimento facial LBPH com CustomTkinter (Python/OpenCV)
- **Dino Run Vecna Edition** — Endless runner temático (JavaScript/Canvas)
- **Pygame Asteroids** — Clássico com profundidade 3D via interpolação de cores (Python/Pygame)
- **Raycasting 2D Engine** — Motor estilo Wolfenstein 3D do zero (JavaScript/Canvas)
- **Elen4Devs** — Suíte web responsiva com calculadoras para devs (JS/CSS/A11y)
- **ZenCalc Mobile** — Calculadora minimalista (React Native/Expo)
- **INMET Weather Dash** — Pipeline completo: scraping + processamento + visualização (Python/Dash/Selenium)
- **Youtube Audio Downloader** — Interface Tkinter para baixar áudios (Python/Tkinter)

---

## Como Rodar Local
```bash
# 1. Entre no projeto Astro
cd codex

# 2. Instale (já tem package-lock.json)
npm ci

# 3. Dev server
npm run dev        # http://localhost:4321

# 4. Qualidade
npm run check      # astro check + tsc --noEmit
npm run test       # vitest run
npm run build      # gera ./dist
npm run preview    # serve ./dist em 4321

# 5. LHCI local (opcional)
npx @lhci/cli@latest autorun
```

---

## CI/CD — GitHub Actions
Workflow em `.github/workflows/codex.yml`:

1. **quality** — `npm ci` → `check` → `test` → `build` → upload artifact (`codex/dist`)
2. **lighthouse** — `npm run build` → `lhci autorun` (assert budgets)
3. **deploy** — `actions/deploy-pages@v4` (após quality + lighthouse passarem)

> **Importante:** Pages deve estar configurado como **Source: GitHub Actions** (Settings → Pages). Enquanto estiver "Deploy from branch", o job `deploy` falha — mas o site antigo continua no ar. Use `workflow_dispatch` para testar deploy manualmente antes de virar a chave.

---

## Referências Rápidas (para próxima sessão)

| Arquivo | O que |
|---|---|
| `codex/src/styles/tokens.css` | Design system completo (cores, espaço, tipo, sombras, utilitários pixel) |
| `codex/src/content.config.ts` | Schema Zod dos projetos |
| `codex/src/content/projects/*.mdx` | Conteúdo real — edite aqui para mudar projetos |
| `codex/src/data/skills.ts` | Grimório (lista de feitiços + proficiência) |
| `codex/src/lib/secrets/definitions.ts` | Lista dos 9 segredos (adicione/remova aqui) |
| `codex/src/lib/secrets/logic.ts` | Lógica pura dos triggers (testável) |
| `codex/src/components/react/SecretsEngine.tsx` | Ilha principal — HUD, terminal, toasts, listeners globais |
| `codex/src/components/react/ProjectFilter.tsx` | Filtro do bestiário (progressive enhancement) |
| `codex/src/pages/index.astro` | Home — monta capítulos, passa dados para ilhas |
| `codex/astro.config.mjs` | Integrações: react, mdx, sitemap |
| `.github/workflows/codex.yml` | CI/CD |
| `codex/lighthouserc.json` | Budgets de perf/a11y |

---

## Decisões Chave (para não re-debater)

1. **Astro + ilhas React** — não SPA, não Next, não SvelteKit. HTML estático primeiro.
2. **Tokens CSS puros** — nada de Tailwind, nada de CSS-in-JS. Design system = contrato.
3. **Conteúdo = MDX + Zod** — drift de dados impossível por construção.
4. **Segredos = dados declarativos** — engine genérica, triggers/rewards tipados, testável.
5. **Tema default = `candle` (escuro)** — `manuscript` (claro) e `void` (secreto) alternativos.
6. **HUD único** — `SecretsEngine` encapsula todo estado reativo (counter, terminal, toasts, theme).
7. **Filtro = enhancement** — cards no HTML estático; ilha só toggle `hidden`.
8. **Deploy = Actions artifact** — CNAME no `public/`, domínio configurado em Settings.
9. **Zero runtime CSS/JS no conteúdo** — só ilhas hidratam.

---

## Próximos Passos (Fase 1 → 3)

| Fase | Entregável |
|---|---|
| **1 — O Codex Público** | Layout completo (Prólogo/Bestiário/Grimório/Correspondência), OG cards, sitemap, 404 |
| **2 — Atmosfera** | Sprites do Diabrete (idle/hover/click), capitulares `::first-letter`, marginalia animada, CRT overlay opt-in |
| **3 — Os Segredos** | Engine completa (konami, terminal, click-count, hour, visit), `/arcanum` com lore, achievements persistentes |

**MVP publicável = fim da Fase 1.** Cada fase deixa o site no ar.

---

*Desenvolvido com 💜 e Dados por Elen Camila Sales Silva.*