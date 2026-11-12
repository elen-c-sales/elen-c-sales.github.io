// src/data/skills.ts — Grimório: lista de feitiços com proficiência
export type SkillCategory =
  | 'linguagens'
  | 'dados-ml'
  | 'web-fullstack'
  | 'gamedev-graficos'
  | 'ferramentas-devops';

export interface Skill {
  name: string;
  category: SkillCategory;
  proficiency: 1 | 2 | 3 | 4 | 5; // 1 = iniciante, 5 = especialista
  icon?: string; // opcional: classe FontAwesome ou emoji
  description?: string;
}

export const skills: Skill[] = [
  // Linguagens
  { name: 'Python', category: 'linguagens', proficiency: 5, icon: 'fab fa-python', description: 'Ecossistema científico, automação, game dev (Pygame), backend (FastAPI/Flask)' },
  { name: 'JavaScript / TypeScript', category: 'linguagens', proficiency: 4, icon: 'fab fa-js', description: 'Vanilla JS, React, React Native, Node.js, tooling (Vite, Astro)' },
  { name: 'R', category: 'linguagens', proficiency: 4, icon: 'fas fa-chart-line', description: 'Análise estatística, visualização (ggplot2, Plotly), Shiny dashboards' },
  { name: 'SQL', category: 'linguagens', proficiency: 4, icon: 'fas fa-database', description: 'PostgreSQL, SQLite, modelagem relacional, queries analíticas complexas' },
  { name: 'HTML5 / CSS3', category: 'linguagens', proficiency: 5, icon: 'fab fa-html5', description: 'Semântico, responsivo, CSS Custom Properties, animações, Grid/Flexbox' },

  // Dados & ML
  { name: 'Pandas / NumPy', category: 'dados-ml', proficiency: 5, icon: 'fas fa-table', description: 'Manipulação, limpeza, análise exploratória, feature engineering' },
  { name: 'Scikit-learn', category: 'dados-ml', proficiency: 4, icon: 'fas fa-brain', description: 'Classificação, regressão, clustering, pipelines, model selection' },
  { name: 'Plotly / Dash', category: 'dados-ml', proficiency: 4, icon: 'fas fa-chart-area', description: 'Dashboards interativos, visualizações web, callbacks reativos' },
  { name: 'Matplotlib / Seaborn', category: 'dados-ml', proficiency: 4, icon: 'fas fa-chart-bar', description: 'Visualizações estáticas publicáveis, estilos customizados' },
  { name: 'Estatística Aplicada', category: 'dados-ml', proficiency: 4, icon: 'fas fa-calculator', description: 'Testes de hipótese, séries temporais, inferência, A/B testing' },

  // Web & Full-Stack
  { name: 'React / React Native', category: 'web-fullstack', proficiency: 4, icon: 'fab fa-react', description: 'Hooks, Context, React Query, Expo, acessibilidade (ARIA)' },
  { name: 'Astro', category: 'web-fullstack', proficiency: 4, icon: 'fas fa-rocket', description: 'Ilhas, content layer, MDX, SEO, deploy estático' },
  { name: 'Node.js / Express / FastAPI', category: 'web-fullstack', proficiency: 3, icon: 'fas fa-server', description: 'APIs REST, autenticação, validação (Zod/Pydantic), testes' },
  { name: 'Git / GitHub Actions', category: 'web-fullstack', proficiency: 4, icon: 'fab fa-git-alt', description: 'CI/CD, workflows, pages deploy, quality gates (LHCI, Vitest)' },
  { name: 'Acessibilidade (WCAG/ARIA)', category: 'web-fullstack', proficiency: 4, icon: 'fas fa-universal-access', description: 'Semântica, focus management, screen readers, testes automatizados' },

  // Game Dev & Gráficos
  { name: 'Pygame', category: 'gamedev-graficos', proficiency: 5, icon: 'fas fa-gamepad', description: 'Loop de jogo, sprites, colisão, partículas, shaders (OpenGL)' },
  { name: 'HTML5 Canvas / WebGL', category: 'gamedev-graficos', proficiency: 3, icon: 'fab fa-chrome', description: 'Raycasting, shaders, animação procedural, otimização' },
  { name: 'Pixel Art / Aseprite', category: 'gamedev-graficos', proficiency: 4, icon: 'fas fa-palette', description: 'Spritesheets, animação frame-a-frame, paletas limitadas' },
  { name: 'OpenCV', category: 'gamedev-graficos', proficiency: 3, icon: 'fas fa-eye', description: 'Visão computacional, reconhecimento facial (LBPH), processamento de imagem' },
  { name: 'Raycasting / Render 2.5D', category: 'gamedev-graficos', proficiency: 3, icon: 'fas fa-cube', description: 'Motor estilo Wolfenstein 3D, DDA, texturas, colisão' },

  // Ferramentas & DevOps
  { name: 'Selenium / Playwright', category: 'ferramentas-devops', proficiency: 4, icon: 'fas fa-robot', description: 'Scraping, automação web, testes E2E, headless' },
  { name: 'Docker', category: 'ferramentas-devops', proficiency: 3, icon: 'fab fa-docker', description: 'Containers, multi-stage builds, compose, deploy' },
  { name: 'Linux / Bash', category: 'ferramentas-devops', proficiency: 3, icon: 'fab fa-linux', description: 'Terminal, scripts, permissões, systemd, SSH' },
  { name: 'VS Code / Neovim', category: 'ferramentas-devops', proficiency: 4, icon: 'fas fa-code', description: 'Extensões, debugging, snippets, LSP, keymaps' },
];

export const skillCategories: { key: SkillCategory; label: string; icon: string }[] = [
  { key: 'linguagens', label: 'Linguagens', icon: 'fas fa-code' },
  { key: 'dados-ml', label: 'Dados & ML', icon: 'fas fa-brain' },
  { key: 'web-fullstack', label: 'Web & Full-Stack', icon: 'fas fa-globe' },
  { key: 'gamedev-graficos', label: 'Game Dev & Gráficos', icon: 'fas fa-gamepad' },
  { key: 'ferramentas-devops', label: 'Ferramentas & DevOps', icon: 'fas fa-tools' },
];

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter(s => s.category === category);
}

export function getFeaturedSkills(limit = 10): Skill[] {
  return [...skills].sort((a, b) => b.proficiency - a.proficiency).slice(0, limit);
}