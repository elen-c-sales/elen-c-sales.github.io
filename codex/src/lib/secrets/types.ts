// src/lib/secrets/types.ts — Tipos da engine de segredos
export type SecretReward =
  | { kind: 'theme'; value: 'manuscript' | 'candle' | 'void' }
  | { kind: 'page'; value: string }
  | { kind: 'hint'; value: string }
  | { kind: 'achievement'; value: string }
  | { kind: 'toast'; value: string };

export type SecretTrigger =
  | { type: 'konami' }
  | { type: 'click-count'; selector: string; count: number }
  | { type: 'click'; selector: string }
  | { type: 'visit'; slug: string }
  | { type: 'event'; name: string }
  | { type: 'hour'; range: [number, number] }  // hora local (inclusive)
  | { type: 'devtools' };

export interface SecretDef {
  id: string;
  title: string;
  trigger: SecretTrigger;
  reward: SecretReward;
  hidden?: boolean; // não aparece no contador até desbloqueado
}

export interface SecretState {
  unlocked: Record<string, boolean>; // id -> true
  progress: Record<string, number>;  // para click-count
  lastCheck: number;                 // timestamp última verificação hour
}

export const STORAGE_KEY = 'codex.secrets.v1';

export const DEFAULT_STATE: SecretState = {
  unlocked: {},
  progress: {},
  lastCheck: Date.now(),
};