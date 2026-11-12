// src/lib/secrets/definitions.ts — Lista dos 9 segredos declarativos
import type { SecretDef } from './types';

export const secrets: SecretDef[] = [
  {
    id: 'console',
    title: 'Console Arcano',
    trigger: { type: 'devtools' },
    reward: { kind: 'hint', value: 'o terminal responde a `~`' },
  },
  {
    id: 'terminal',
    title: 'Terminal do Códice',
    trigger: { type: 'event', name: 'terminal-open' },
    reward: { kind: 'page', value: '/arcanum' },
  },
  {
    id: 'konami',
    title: 'Código Antigo',
    trigger: { type: 'konami' },
    reward: { kind: 'theme', value: 'void' },
  },
  {
    id: 'diabrete',
    title: 'Amigo do Diabrete',
    trigger: { type: 'click-count', selector: '[data-secret="diabrete"]', count: 5 },
    reward: { kind: 'achievement', value: 'Amigo do Diabrete' },
  },
  {
    id: 'sigil',
    title: 'Sigilo do Rodapé',
    trigger: { type: 'click', selector: '#sigil-footer' },
    reward: { kind: 'page', value: '/arcanum' },
  },
  {
    id: 'midnight',
    title: 'Vigília da Meia-Noite',
    trigger: { type: 'hour', range: [0, 1] },
    reward: { kind: 'toast', value: 'o códice mudou ao romper da meia-noite...' },
  },
  {
    id: 'gunship-egg',
    title: 'Segredo da Corveta',
    trigger: { type: 'visit', slug: 'gunship-cqb' },
    reward: { kind: 'hint', value: 'esta entrada guarda um segredo...' },
  },
  {
    id: 'dino-egg',
    title: 'Observador Vecna',
    trigger: { type: 'visit', slug: 'dino-run-vecna-edition' },
    reward: { kind: 'hint', value: 'o Vecna observa...' },
  },
  {
    id: 'arcanum-read',
    title: 'Conhecimento Proibido',
    trigger: { type: 'event', name: 'arcanum-read' },
    reward: { kind: 'achievement', value: 'Conhecimento Proibido' },
  },
];

export function getSecretById(id: string): SecretDef | undefined {
  return secrets.find(s => s.id === id);
}

export function getVisibleSecrets(): SecretDef[] {
  return secrets.filter(s => !s.hidden);
}

export function getSecretCount(): number {
  return secrets.length;
}